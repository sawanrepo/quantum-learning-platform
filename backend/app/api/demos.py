from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.schemas import PreloadedDemo, CircuitExecutionRequest, GateModel

router = APIRouter(prefix="/demos", tags=["College Demonstrations"])

COLLEGE_DEMOS: List[PreloadedDemo] = [
    PreloadedDemo(
        id="demo-superposition",
        name="Demo 1 — Single Qubit Superposition",
        category="Fundamentals",
        description="Puts a qubit into an equal superposition state (|0⟩ + |1⟩)/√2 using the Hadamard gate and simulates quantum wavefunction collapse upon measurement.",
        circuit=CircuitExecutionRequest(
            qubits=1,
            gates=[
                GateModel(id="d1", gate="H", target=0, step=0),
                GateModel(id="d2", gate="M", target=0, step=1)
            ],
            shots=1024
        ),
        key_takeaway="Demonstrates that quantum bits hold 50/50 probability amplitudes until measured."
    ),
    PreloadedDemo(
        id="demo-entanglement",
        name="Demo 2 — Bell State Quantum Entanglement",
        category="Entanglement",
        description="Entangles two qubits using H and CNOT to create the maximally entangled Bell state (|00⟩ + |11⟩)/√2.",
        circuit=CircuitExecutionRequest(
            qubits=2,
            gates=[
                GateModel(id="d1", gate="H", target=0, step=0),
                GateModel(id="d2", gate="CNOT", target=1, control=0, step=1),
                GateModel(id="d3", gate="M", target=0, step=2),
                GateModel(id="d4", gate="M", target=1, step=2)
            ],
            shots=1024
        ),
        key_takeaway="Shows non-local quantum correlations: measuring one qubit instantly determines the state of the other."
    ),
    PreloadedDemo(
        id="demo-teleportation",
        name="Demo 3 — Quantum Teleportation Protocol",
        category="Protocol",
        description="Teleports an unknown quantum state |ψ⟩ from Alice (q0) to Bob (q2) using a shared Bell pair (q1, q2) and classical bit communication.",
        circuit=CircuitExecutionRequest(
            qubits=3,
            gates=[
                # Prepare state to teleport on q0: RX(1.2)
                GateModel(id="d1", gate="RX", target=0, params={"theta": 1.2}, step=0),
                # Create Bell pair between q1 and q2
                GateModel(id="d2", gate="H", target=1, step=1),
                GateModel(id="d3", gate="CNOT", target=2, control=1, step=2),
                # Alice Bell measurement (q0, q1)
                GateModel(id="d4", gate="CNOT", target=1, control=0, step=3),
                GateModel(id="d5", gate="H", target=0, step=4),
                # Bob correction conditioned on Alice results
                GateModel(id="d6", gate="CNOT", target=2, control=1, step=5),
                GateModel(id="d7", gate="Z", target=2, step=6),
                GateModel(id="d8", gate="M", target=2, step=7)
            ],
            shots=1024
        ),
        key_takeaway="Transfers quantum state vector |ψ⟩ across space without sending physical particles!"
    )
]

@router.get("/list", response_model=List[PreloadedDemo])
async def list_college_demos():
    """
    Get all preloaded interactive quantum demonstration flows.
    """
    return COLLEGE_DEMOS

@router.get("/{demo_id}", response_model=PreloadedDemo)
async def get_demo_detail(demo_id: str):
    for d in COLLEGE_DEMOS:
        if d.id == demo_id:
            return d
    raise HTTPException(status_code=404, detail="Demo not found")
