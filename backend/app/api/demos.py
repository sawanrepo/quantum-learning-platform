from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.schemas import PreloadedDemo, CircuitExecutionRequest, GateModel

router = APIRouter(prefix="/demos", tags=["College Demonstrations"])

COLLEGE_DEMOS: List[PreloadedDemo] = [
    PreloadedDemo(
        id="demo-superposition",
        name="Demo 1 — Single Qubit Superposition & Collapse",
        category="Fundamentals",
        description="Rotates a definite ground state |0⟩ onto the equator of the Bloch sphere (|0⟩ + |1⟩)/√2 using the Hadamard gate. Measuring this qubit forces a non-deterministic projection collapse.",
        circuit=CircuitExecutionRequest(
            qubits=1,
            gates=[
                GateModel(id="d1", gate="H", target=0, step=0),
                GateModel(id="d2", gate="M", target=0, step=1)
            ],
            shots=1024
        ),
        key_takeaway="A qubit exists in an unbroken linear combination of |0⟩ and |1⟩ with equal probability amplitudes until physical measurement induces wavefunction collapse.",
        concept="Superposition & Wavefunction Collapse (Born Rule)",
        theory="The Hadamard gate H = (1/√2)[[1, 1], [1, -1]] rotates basis state |0⟩ into equal superposition state |+⟩. According to the Born rule, the probability of measuring outcome |x⟩ is P(x) = |⟨x|ψ⟩|² = (1/√2)² = 0.50 (50%)."
    ),
    PreloadedDemo(
        id="demo-entanglement",
        name="Demo 2 — Bell State Entanglement (|Φ⁺⟩)",
        category="Entanglement",
        description="Creates the canonical maximally entangled bipartite Bell state (|00⟩ + |11⟩)/√2 using a Hadamard gate followed by an entangling CNOT gate. Demonstrates non-separable quantum correlation.",
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
        key_takeaway="Measurement outcomes of both qubits are 100% correlated: if qubit 0 is measured to be 0, qubit 1 is guaranteed to be 0; if qubit 0 is 1, qubit 1 is guaranteed to be 1.",
        concept="EPR Paradox & Quantum Non-Separability",
        theory="The joint statevector cannot be factored into independent single-qubit states |ψ⟩ ≠ |ψ_A⟩ ⊗ |ψ_B⟩. This fundamental non-locality resolves the 1935 Einstein-Podolsky-Rosen paradox and violates Bell's classical inequality."
    ),
    PreloadedDemo(
        id="demo-superdense-coding",
        name="Demo 3 — Superdense Coding Protocol",
        category="Protocols",
        description="Alice transmits two classical bits ('11') to Bob across space by manipulating and sending only a single physical qubit from a pre-shared entangled Bell pair.",
        circuit=CircuitExecutionRequest(
            qubits=2,
            gates=[
                # 1. Distribute Bell pair
                GateModel(id="d1", gate="H", target=0, step=0),
                GateModel(id="d2", gate="CNOT", target=1, control=0, step=1),
                # 2. Alice encodes classical message '11' using Pauli X and Z
                GateModel(id="d3", gate="X", target=0, step=2),
                GateModel(id="d4", gate="Z", target=0, step=3),
                # 3. Bob receives Alice's qubit and performs Bell measurement
                GateModel(id="d5", gate="CNOT", target=1, control=0, step=4),
                GateModel(id="d6", gate="H", target=0, step=5),
                GateModel(id="d7", gate="M", target=0, step=6),
                GateModel(id="d8", gate="M", target=1, step=6)
            ],
            shots=1024
        ),
        key_takeaway="By leveraging 1 e-bit (entangled pair), 2 classical bits of information are conveyed through the transmission of just 1 physical qubit.",
        concept="Dense Quantum Communication Capacity",
        theory="Alice maps the shared Bell state |Φ⁺⟩ into |Ψ⁻⟩ = (|01⟩ - |10⟩)/√2 using Z·X. When Bob performs the inverse Bell circuit (CNOT followed by H), the states disentangle into computational basis |11⟩ with 100% fidelity."
    ),
    PreloadedDemo(
        id="demo-teleportation",
        name="Demo 4 — Quantum State Teleportation Protocol",
        category="Protocols",
        description="Transfers an unknown arbitrary quantum state |ψ⟩ from Alice (q0) to Bob (q2) using a shared Bell pair (q1, q2) and classical feed-forward correction.",
        circuit=CircuitExecutionRequest(
            qubits=3,
            gates=[
                # Prepare state |ψ⟩ = RX(1.2)|0⟩ on q0
                GateModel(id="d1", gate="RX", target=0, params={"theta": 1.2}, step=0),
                # Distribute Bell pair between q1 and q2
                GateModel(id="d2", gate="H", target=1, step=1),
                GateModel(id="d3", gate="CNOT", target=2, control=1, step=2),
                # Alice Bell-state measurement on q0 and q1
                GateModel(id="d4", gate="CNOT", target=1, control=0, step=3),
                GateModel(id="d5", gate="H", target=0, step=4),
                # Bob correction conditioned on Alice's classical outcomes
                GateModel(id="d6", gate="CNOT", target=2, control=1, step=5),
                GateModel(id="d7", gate="Z", target=2, step=6),
                GateModel(id="d8", gate="M", target=2, step=7)
            ],
            shots=1024
        ),
        key_takeaway="Reconstructs the original statevector |ψ⟩ on the target qubit while destroying it at the source, strictly satisfying the Quantum No-Cloning Theorem.",
        concept="Quantum Disembodied Teleportation",
        theory="Teleportation transfers quantum information rather than physical matter. Alice's measurement destroys the state |ψ⟩ on qubit 0 while projecting Bob's qubit 2 into one of 4 unitarily rotatable variants of |ψ⟩."
    ),
    PreloadedDemo(
        id="demo-ghz-state",
        name="Demo 5 — 3-Qubit GHZ State Entanglement",
        category="Entanglement",
        description="Synthesizes the tripartite Greenberger-Horne-Zeilinger (GHZ) state (|000⟩ + |111⟩)/√2. Demonstrates true multi-party quantum entanglement where all 3 qubits collapse synchronously.",
        circuit=CircuitExecutionRequest(
            qubits=3,
            gates=[
                GateModel(id="d1", gate="H", target=0, step=0),
                GateModel(id="d2", gate="CNOT", target=1, control=0, step=1),
                GateModel(id="d3", gate="CNOT", target=2, control=1, step=2),
                GateModel(id="d4", gate="M", target=0, step=3),
                GateModel(id="d5", gate="M", target=1, step=3),
                GateModel(id="d6", gate="M", target=2, step=3)
            ],
            shots=1024
        ),
        key_takeaway="Measuring any single qubit collapses all three qubits to that exact same value (|000⟩ or |111⟩ with 50/50 probability), with exactly zero probability for any mixed state like |010⟩ or |101⟩.",
        concept="Tripartite Genuine Multi-Qubit Entanglement",
        theory="GHZ states provide direct, non-probabilistic refutations of local realism without requiring Bell inequalities. They form the foundational resource for quantum secret sharing and distributed quantum networks."
    ),
    PreloadedDemo(
        id="demo-deutsch-jozsa",
        name="Demo 6 — Deutsch-Jozsa Algorithm (Exponential Speedup)",
        category="Algorithms",
        description="Solves whether a hidden oracle function f(x) is constant or balanced in a SINGLE quantum query using quantum interference and phase kickback.",
        circuit=CircuitExecutionRequest(
            qubits=2,
            gates=[
                # Ancilla qubit prepared in |-> state
                GateModel(id="d1", gate="X", target=1, step=0),
                GateModel(id="d2", gate="H", target=0, step=1),
                GateModel(id="d3", gate="H", target=1, step=1),
                # Oracle: balanced function f(x) = x via CNOT
                GateModel(id="d4", gate="CNOT", target=1, control=0, step=2),
                # Interference on input register
                GateModel(id="d5", gate="H", target=0, step=3),
                GateModel(id="d6", gate="M", target=0, step=4)
            ],
            shots=1024
        ),
        key_takeaway="A classical computer requires 2^(n-1) + 1 queries in the worst case to determine whether a black-box is constant or balanced. Deutsch-Jozsa solves it with 100% certainty in 1 single quantum query.",
        concept="Phase Kickback & Quantum Oracular Query",
        theory="Because the target ancilla is prepared in state |−⟩ = (|0⟩ − |1⟩)/√2, applying the oracle CNOT(|x⟩|−⟩) kicks a (−1)^(f(x)) phase directly onto the input register. Final Hadamard produces constructive interference at |1⟩ for balanced functions."
    ),
    PreloadedDemo(
        id="demo-grover-search",
        name="Demo 7 — Grover's Search Algorithm (2-Qubit Database)",
        category="Algorithms",
        description="Demonstrates quadratic speedup for searching an unsorted database of N=4 elements. Locates target item |11⟩ using an Oracle followed by the Grover Diffusion Operator (Inversion about the mean).",
        circuit=CircuitExecutionRequest(
            qubits=2,
            gates=[
                # 1. Initialize uniform superposition
                GateModel(id="d1", gate="H", target=0, step=0),
                GateModel(id="d2", gate="H", target=1, step=0),
                # 2. Phase Oracle: marks state |11> with negative phase
                GateModel(id="d3", gate="H", target=1, step=1),
                GateModel(id="d4", gate="CNOT", target=1, control=0, step=2),
                GateModel(id="d5", gate="H", target=1, step=3),
                # 3. Grover Diffusion Operator (Inversion about mean)
                GateModel(id="d6", gate="H", target=0, step=4),
                GateModel(id="d7", gate="H", target=1, step=4),
                GateModel(id="d8", gate="X", target=0, step=5),
                GateModel(id="d9", gate="X", target=1, step=5),
                GateModel(id="d10", gate="H", target=1, step=6),
                GateModel(id="d11", gate="CNOT", target=1, control=0, step=7),
                GateModel(id="d12", gate="H", target=1, step=8),
                GateModel(id="d13", gate="X", target=0, step=9),
                GateModel(id="d14", gate="X", target=1, step=9),
                GateModel(id="d15", gate="H", target=0, step=10),
                GateModel(id="d16", gate="H", target=1, step=10),
                # 4. Measure target
                GateModel(id="d17", gate="M", target=0, step=11),
                GateModel(id="d18", gate="M", target=1, step=11)
            ],
            shots=1024
        ),
        key_takeaway="Grover amplitude amplification reflects the quantum state across the marked vector, boosting probability of |11⟩ from 25% to 100% in a single step (O(√N) speedup).",
        concept="Amplitude Amplification & Geometric Rotation",
        theory="The Grover iterator G = (2|s⟩⟨s| - I) · O reflects the state about the superposition vector |s⟩. For N=4, exactly 1 rotation rotates the 2D subspace directly into the target state |w⟩ = |11⟩."
    ),
    PreloadedDemo(
        id="demo-qft",
        name="Demo 8 — 2-Qubit Quantum Fourier Transform (QFT)",
        category="Algorithms",
        description="Maps computational basis states into discrete frequency/phase states. The core mathematical algorithm underlying Shor's factoring and Quantum Phase Estimation.",
        circuit=CircuitExecutionRequest(
            qubits=2,
            gates=[
                # Input state preparation: |10>
                GateModel(id="d1", gate="X", target=0, step=0),
                # QFT on qubit 0
                GateModel(id="d2", gate="H", target=0, step=1),
                # Controlled phase rotation R_Z(pi/2)
                GateModel(id="d3", gate="RZ", target=1, params={"theta": 1.5707963}, step=2),
                GateModel(id="d4", gate="CNOT", target=1, control=0, step=3),
                # QFT on qubit 1
                GateModel(id="d5", gate="H", target=1, step=4),
                # SWAP output qubits
                GateModel(id="d6", gate="CNOT", target=1, control=0, step=5),
                GateModel(id="d7", gate="CNOT", target=0, control=1, step=6),
                GateModel(id="d8", gate="CNOT", target=1, control=0, step=7),
                GateModel(id="d9", gate="M", target=0, step=8),
                GateModel(id="d10", gate="M", target=1, step=8)
            ],
            shots=1024
        ),
        key_takeaway="QFT computes the discrete Fourier transform of quantum amplitudes in O(n²) quantum gates, compared to O(n·2ⁿ) for the classical Fast Fourier Transform (FFT).",
        concept="Quantum Phase Encoding & Period Finding",
        theory="QFT transforms state |j⟩ into (1/√2ⁿ) ∑ₖ e^(2πi·j·k / 2ⁿ) |k⟩. This phase encoding enables efficient extraction of hidden periods in modular arithmetic."
    ),
    PreloadedDemo(
        id="demo-quantum-adder",
        name="Demo 9 — Reversible Quantum Half Adder Circuit",
        category="Circuits",
        description="Performs binary addition of two quantum bits A and B with zero information loss. Calculates Sum = A ⊕ B and Carry = A ∧ B using reversible quantum logic.",
        circuit=CircuitExecutionRequest(
            qubits=3,
            gates=[
                # Inputs: A=1 (q0), B=1 (q1), Carry Ancilla=0 (q2)
                GateModel(id="d1", gate="X", target=0, step=0),
                GateModel(id="d2", gate="X", target=1, step=0),
                # Carry computation (A AND B -> q2) via Toffoli decomposition
                GateModel(id="d3", gate="H", target=2, step=1),
                GateModel(id="d4", gate="CNOT", target=2, control=1, step=2),
                GateModel(id="d5", gate="T", target=2, step=3),
                GateModel(id="d6", gate="CNOT", target=2, control=0, step=4),
                GateModel(id="d7", gate="T", target=2, step=5),
                GateModel(id="d8", gate="CNOT", target=2, control=1, step=6),
                GateModel(id="d9", gate="H", target=2, step=7),
                # Sum computation (A XOR B -> q1)
                GateModel(id="d10", gate="CNOT", target=1, control=0, step=8),
                GateModel(id="d11", gate="M", target=1, step=9),
                GateModel(id="d12", gate="M", target=2, step=9)
            ],
            shots=1024
        ),
        key_takeaway="Quantum addition is 100% reversible: 1 + 1 produces Sum=0 (on q1) and Carry=1 (on q2) without destroying input information or generating Landauer thermodynamic heat.",
        concept="Reversible Computation & Landauer's Principle",
        theory="Classical digital adders erase bits, generating kT·ln(2) heat dissipation per bit erased. Quantum unitary gates preserve information reversibly with bijective unitary evolution U†U = I."
    ),
    PreloadedDemo(
        id="demo-bit-flip-code",
        name="Demo 10 — 3-Qubit Quantum Error Correction Code",
        category="Error Correction",
        description="Protects a quantum bit against environmental bit-flip noise (Pauli X). Encodes logical |0_L⟩ into 3 physical qubits |000⟩, injects a bit-flip error on physical qubit 1, and restores the logical state via syndrome detection.",
        circuit=CircuitExecutionRequest(
            qubits=3,
            gates=[
                # 1. Encoding: Logical |0_L> -> |000>
                GateModel(id="d1", gate="CNOT", target=1, control=0, step=0),
                GateModel(id="d2", gate="CNOT", target=2, control=0, step=1),
                # 2. Simulated Environment Noise: Bit flip on Qubit 1
                GateModel(id="d3", gate="X", target=1, step=2),
                # 3. Syndrome Extraction & Recovery
                GateModel(id="d4", gate="CNOT", target=1, control=0, step=3),
                GateModel(id="d5", gate="CNOT", target=1, control=2, step=4),
                GateModel(id="d6", gate="X", target=1, step=5),
                # 4. Measure all physical qubits
                GateModel(id="d7", gate="M", target=0, step=6),
                GateModel(id="d8", gate="M", target=1, step=6),
                GateModel(id="d9", gate="M", target=2, step=6)
            ],
            shots=1024
        ),
        key_takeaway="Corrects bit-flip decoherence without measuring or collapsing the stored logical quantum superposition, demonstrating fault-tolerant quantum memory.",
        concept="Quantum Error Correction & Syndrome Parity",
        theory="By measuring parity observables Z_1 Z_2 and Z_2 Z_3 rather than individual qubit values, the quantum syndrome identifies which qubit flipped without learning its quantum state."
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
