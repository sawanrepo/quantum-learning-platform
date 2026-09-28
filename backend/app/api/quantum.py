from fastapi import APIRouter, HTTPException, Depends
from app.schemas.schemas import (
    CircuitExecutionRequest,
    SimulationResultResponse,
    AICodeGenRequest,
    AICodeGenResponse
)
from app.services.quantum.simulator import run_quantum_simulation
from app.services.quantum.code_gen import (
    generate_qiskit_code,
    generate_pennylane_code,
    generate_cirq_code
)

router = APIRouter(prefix="/quantum", tags=["Quantum Simulation"])

@router.post("/simulate", response_model=SimulationResultResponse)
async def simulate_circuit(req: CircuitExecutionRequest):
    """
    Execute quantum simulation on Qiskit Aer / Numpy statevector engine.
    Returns measurement probabilities, counts, statevector amplitudes, and Bloch vectors.
    """
    try:
        result = run_quantum_simulation(req)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quantum Simulation Error: {str(e)}")


@router.post("/code-gen", response_model=AICodeGenResponse)
async def generate_framework_code(req: AICodeGenRequest):
    """
    Convert a quantum circuit into standalone Python code for Qiskit, PennyLane, or Cirq.
    """
    fw = req.framework.lower()
    if fw == "pennylane":
        code = generate_pennylane_code(req.circuit)
        exp = "Generated standalone PennyLane QNode function."
    elif fw == "cirq":
        code = generate_cirq_code(req.circuit)
        exp = "Generated Google Cirq quantum circuit execution script."
    else:
        code = generate_qiskit_code(req.circuit)
        exp = "Generated IBM Qiskit Aer simulator script."
        
    return AICodeGenResponse(
        code=code,
        framework=fw,
        explanation=exp
    )
