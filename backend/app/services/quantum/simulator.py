import time
import math
import numpy as np
from typing import Dict, List, Tuple, Optional
from app.schemas.schemas import (
    CircuitExecutionRequest,
    SimulationResultResponse,
    ComplexNumber,
    BlochSphereVector
)
from app.services.quantum.bloch import calculate_bloch_vectors
from app.services.quantum.code_gen import (
    generate_qiskit_code,
    generate_pennylane_code,
    generate_cirq_code
)

# Attempt Qiskit import
QISKIT_AVAILABLE = False
try:
    from qiskit import QuantumCircuit, transpile
    from qiskit.quantum_info import Statevector
    QISKIT_AVAILABLE = True
except Exception:
    QISKIT_AVAILABLE = False


def _get_single_qubit_gate_matrix(gate_name: str, params: Dict[str, float]) -> np.ndarray:
    name = gate_name.upper()
    inv_sqrt2 = 1.0 / np.sqrt(2.0)
    
    if name == "H":
        return np.array([[inv_sqrt2, inv_sqrt2], [inv_sqrt2, -inv_sqrt2]], dtype=complex)
    elif name == "X":
        return np.array([[0.0, 1.0], [1.0, 0.0]], dtype=complex)
    elif name == "Y":
        return np.array([[0.0, -1j], [1j, 0.0]], dtype=complex)
    elif name == "Z":
        return np.array([[1.0, 0.0], [0.0, -1.0]], dtype=complex)
    elif name == "S":
        return np.array([[1.0, 0.0], [0.0, 1j]], dtype=complex)
    elif name == "T":
        return np.array([[1.0, 0.0], [0.0, np.exp(1j * np.pi / 4.0)]], dtype=complex)
    elif name == "RX":
        theta = params.get("theta", np.pi / 2.0)
        return np.array([[np.cos(theta / 2.0), -1j * np.sin(theta / 2.0)],
                         [-1j * np.sin(theta / 2.0), np.cos(theta / 2.0)]], dtype=complex)
    elif name == "RY":
        theta = params.get("theta", np.pi / 2.0)
        return np.array([[np.cos(theta / 2.0), -np.sin(theta / 2.0)],
                         [np.sin(theta / 2.0), np.cos(theta / 2.0)]], dtype=complex)
    elif name == "RZ":
        theta = params.get("theta", np.pi / 2.0)
        return np.array([[np.exp(-1j * theta / 2.0), 0.0],
                         [0.0, np.exp(1j * theta / 2.0)]], dtype=complex)
    else:
        return np.eye(2, dtype=complex)


def _apply_gate_numpy(statevector: np.ndarray, num_qubits: int, gate_name: str, target: int, control: Optional[int], params: Dict[str, float]) -> np.ndarray:
    name = gate_name.upper()
    dim = 2 ** num_qubits
    new_sv = np.copy(statevector)
    
    if name in ["H", "X", "Y", "Z", "S", "T", "RX", "RY", "RZ"]:
        mat = _get_single_qubit_gate_matrix(name, params)
        # Apply matrix to target qubit
        for i in range(dim):
            bit = (i >> target) & 1
            if bit == 0:
                i0 = i
                i1 = i | (1 << target)
                val0 = statevector[i0]
                val1 = statevector[i1]
                new_sv[i0] = mat[0, 0] * val0 + mat[0, 1] * val1
                new_sv[i1] = mat[1, 0] * val0 + mat[1, 1] * val1
    
    elif name in ["CNOT", "CX"]:
        ctrl = control if control is not None else 0
        # CNOT flips target if control is 1
        for i in range(dim):
            ctrl_bit = (i >> ctrl) & 1
            tgt_bit = (i >> target) & 1
            if ctrl_bit == 1 and tgt_bit == 0:
                i0 = i
                i1 = i | (1 << target)
                new_sv[i0], new_sv[i1] = statevector[i1], statevector[i0]

    elif name == "CZ":
        ctrl = control if control is not None else 0
        # CZ applies a phase flip (-1) when both qubits are |1⟩
        for i in range(dim):
            ctrl_bit = (i >> ctrl) & 1
            tgt_bit = (i >> target) & 1
            if ctrl_bit == 1 and tgt_bit == 1:
                new_sv[i] = -statevector[i]
                
    elif name == "SWAP":
        q1 = target
        q2 = control if control is not None else (target + 1) % num_qubits
        for i in range(dim):
            b1 = (i >> q1) & 1
            b2 = (i >> q2) & 1
            if b1 != b2 and b1 == 0:
                # swap bit b1 and b2
                i_swapped = i ^ ((1 << q1) | (1 << q2))
                new_sv[i], new_sv[i_swapped] = statevector[i_swapped], statevector[i]

    return new_sv


def run_numpy_quantum_simulation(req: CircuitExecutionRequest) -> Tuple[np.ndarray, Dict[str, float], Dict[str, int]]:
    num_qubits = req.qubits
    dim = 2 ** num_qubits
    
    # Statevector initialized to |0...0>
    sv = np.zeros(dim, dtype=complex)
    sv[0] = 1.0 + 0.0j

    # Sort gates by timeline step
    gates = sorted(req.gates, key=lambda g: g.step or 0)

    for g in gates:
        if g.gate.upper() != "M":
            sv = _apply_gate_numpy(sv, num_qubits, g.gate, g.target, g.control, g.params or {})

    # Calculate exact probabilities
    probs = {}
    prob_array = np.abs(sv) ** 2
    
    # Format binary string representation (e.g. "00", "01", "10", "11")
    for i in range(dim):
        bitstring = format(i, f"0{num_qubits}b")
        probs[bitstring] = float(round(prob_array[i], 6))

    # Sample measurement counts based on probability distribution
    counts = {}
    if req.shots > 0 and len(prob_array) > 0:
        # Normalize in case of float precision
        p_norm = prob_array / np.sum(prob_array)
        samples = np.random.choice(dim, size=req.shots, p=p_norm)
        unique, counts_arr = np.unique(samples, return_counts=True)
        for idx, count in zip(unique, counts_arr):
            bitstring = format(idx, f"0{num_qubits}b")
            counts[bitstring] = int(count)

    return sv, probs, counts


def run_quantum_simulation(req: CircuitExecutionRequest) -> SimulationResultResponse:
    start_time = time.time()
    
    # Execute statevector engine
    sv, probs, counts = run_numpy_quantum_simulation(req)

    # Compute Bloch sphere vectors for each qubit
    bloch_vectors = calculate_bloch_vectors(sv, req.qubits)

    # Format statevector output
    formatted_sv = []
    for val in sv:
        mag = float(np.abs(val))
        phase = float(np.angle(val))
        formatted_sv.append(
            ComplexNumber(
                real=float(round(val.real, 6)),
                imag=float(round(val.imag, 6)),
                magnitude=float(round(mag, 6)),
                phase=float(round(phase, 6))
            )
        )

    exec_time = round((time.time() - start_time) * 1000.0, 2)

    # Code generation
    qiskit_code = generate_qiskit_code(req)
    pennylane_code = generate_pennylane_code(req)
    cirq_code = generate_cirq_code(req)

    return SimulationResultResponse(
        counts=counts,
        probabilities=probs,
        statevector=formatted_sv,
        bloch_vectors=bloch_vectors,
        num_qubits=req.qubits,
        shots=req.shots,
        execution_time_ms=exec_time,
        qiskit_code=qiskit_code,
        pennylane_code=pennylane_code,
        cirq_code=cirq_code
    )
