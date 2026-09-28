from typing import List
from app.schemas.schemas import GateModel, CircuitExecutionRequest

def generate_qiskit_code(circuit_req: CircuitExecutionRequest) -> str:
    lines = [
        "from qiskit import QuantumCircuit, transpile",
        "from qiskit_aer import AerSimulator",
        "",
        f"# Create circuit with {circuit_req.qubits} qubits",
        f"qc = QuantumCircuit({circuit_req.qubits})"
    ]
    
    # Sort gates by step
    gates = sorted(circuit_req.gates, key=lambda g: g.step or 0)
    
    for g in gates:
        gate_name = g.gate.upper()
        tgt = g.target
        ctrl = g.control
        
        if gate_name == "H":
            lines.append(f"qc.h({tgt})")
        elif gate_name == "X":
            lines.append(f"qc.x({tgt})")
        elif gate_name == "Y":
            lines.append(f"qc.y({tgt})")
        elif gate_name == "Z":
            lines.append(f"qc.z({tgt})")
        elif gate_name == "S":
            lines.append(f"qc.s({tgt})")
        elif gate_name == "T":
            lines.append(f"qc.t({tgt})")
        elif gate_name == "RX":
            theta = g.params.get("theta", 1.5708)
            lines.append(f"qc.rx({theta}, {tgt})")
        elif gate_name == "RY":
            theta = g.params.get("theta", 1.5708)
            lines.append(f"qc.ry({theta}, {tgt})")
        elif gate_name == "RZ":
            theta = g.params.get("theta", 1.5708)
            lines.append(f"qc.rz({theta}, {tgt})")
        elif gate_name == "CNOT" or gate_name == "CX":
            c = ctrl if ctrl is not None else 0
            lines.append(f"qc.cx({c}, {tgt})")
        elif gate_name == "SWAP":
            c = ctrl if ctrl is not None else 0
            lines.append(f"qc.swap({c}, {tgt})")
        elif gate_name == "M" or gate_name == "MEASURE":
            lines.append(f"qc.measure_all()")

    lines.extend([
        "",
        "# Execute on Aer simulator",
        "simulator = AerSimulator()",
        "compiled_circuit = transpile(qc, simulator)",
        f"job = simulator.run(compiled_circuit, shots={circuit_req.shots})",
        "result = job.result()",
        "counts = result.get_counts(compiled_circuit)",
        "print('Measurement Counts:', counts)"
    ])
    return "\n".join(lines)


def generate_pennylane_code(circuit_req: CircuitExecutionRequest) -> str:
    lines = [
        "import pennylane as qml",
        "from pennylane import numpy as np",
        "",
        f"dev = qml.device('default.qubit', wires={circuit_req.qubits}, shots={circuit_req.shots})",
        "",
        "@qml.qnode(dev)",
        "def circuit():"
    ]
    
    gates = sorted(circuit_req.gates, key=lambda g: g.step or 0)
    
    if not gates:
        lines.append("    pass")
    else:
        for g in gates:
            gate_name = g.gate.upper()
            tgt = g.target
            ctrl = g.control
            
            if gate_name == "H":
                lines.append(f"    qml.Hadamard(wires={tgt})")
            elif gate_name == "X":
                lines.append(f"    qml.PauliX(wires={tgt})")
            elif gate_name == "Y":
                lines.append(f"    qml.PauliY(wires={tgt})")
            elif gate_name == "Z":
                lines.append(f"    qml.PauliZ(wires={tgt})")
            elif gate_name == "S":
                lines.append(f"    qml.S(wires={tgt})")
            elif gate_name == "T":
                lines.append(f"    qml.T(wires={tgt})")
            elif gate_name == "RX":
                theta = g.params.get("theta", 1.5708)
                lines.append(f"    qml.RX({theta}, wires={tgt})")
            elif gate_name == "RY":
                theta = g.params.get("theta", 1.5708)
                lines.append(f"    qml.RY({theta}, wires={tgt})")
            elif gate_name == "RZ":
                theta = g.params.get("theta", 1.5708)
                lines.append(f"    qml.RZ({theta}, wires={tgt})")
            elif gate_name in ["CNOT", "CX"]:
                c = ctrl if ctrl is not None else 0
                lines.append(f"    qml.CNOT(wires=[{c}, {tgt}])")
            elif gate_name == "SWAP":
                c = ctrl if ctrl is not None else 0
                lines.append(f"    qml.SWAP(wires=[{c}, {tgt}])")

    lines.extend([
        "    return qml.probs(wires=range(" + str(circuit_req.qubits) + "))",
        "",
        "print('State Probabilities:', circuit())"
    ])
    return "\n".join(lines)


def generate_cirq_code(circuit_req: CircuitExecutionRequest) -> str:
    lines = [
        "import cirq",
        "",
        f"# Define {circuit_req.qubits} line qubits",
        f"qubits = cirq.LineQubit.range({circuit_req.qubits})",
        "circuit = cirq.Circuit()",
        ""
    ]
    
    gates = sorted(circuit_req.gates, key=lambda g: g.step or 0)
    for g in gates:
        gate_name = g.gate.upper()
        tgt = g.target
        ctrl = g.control
        
        if gate_name == "H":
            lines.append(f"circuit.append(cirq.H(qubits[{tgt}]))")
        elif gate_name == "X":
            lines.append(f"circuit.append(cirq.X(qubits[{tgt}]))")
        elif gate_name == "Y":
            lines.append(f"circuit.append(cirq.Y(qubits[{tgt}]))")
        elif gate_name == "Z":
            lines.append(f"circuit.append(cirq.Z(qubits[{tgt}]))")
        elif gate_name == "S":
            lines.append(f"circuit.append(cirq.S(qubits[{tgt}]))")
        elif gate_name == "T":
            lines.append(f"circuit.append(cirq.T(qubits[{tgt}]))")
        elif gate_name in ["CNOT", "CX"]:
            c = ctrl if ctrl is not None else 0
            lines.append(f"circuit.append(cirq.CNOT(qubits[{c}], qubits[{tgt}]))")
        elif gate_name == "M":
            lines.append(f"circuit.append(cirq.measure(qubits[{tgt}], key='m{tgt}'))")

    lines.extend([
        "",
        "# Simulate circuit",
        "simulator = cirq.Simulator()",
        f"result = simulator.run(circuit, repetitions={circuit_req.shots})",
        "print(result)"
    ])
    return "\n".join(lines)
