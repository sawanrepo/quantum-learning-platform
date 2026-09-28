from typing import List, Dict, Optional
from app.schemas.schemas import LessonModule, CircuitExecutionRequest, GateModel, QuizQuestion, QuizOption, ChallengeDefinition

MODULES: List[LessonModule] = [
    LessonModule(
        id="fund-1",
        title="Classical Bits vs. Quantum Qubits",
        category="fundamentals",
        description="Discover the core building block of quantum information processing: the Qubit and state superposition.",
        duration_minutes=15,
        difficulty="beginner",
        content_markdown=r"""# 1. Classical Bits vs. Quantum Qubits

In classical computing, the fundamental unit of information is a **bit**, which can strictly be in state `0` or `1`.

In **quantum computing**, the fundamental unit is a **qubit** (quantum bit). A qubit's state $|\psi\rangle$ is described mathematically as a linear combination (superposition) of state $|0\rangle$ and state $|1\rangle$:

$$|\psi\\rangle = \\alpha |0\\rangle + \\beta |1\\rangle$$

where $\\alpha, \\beta \\in \\mathbb{C}$ are complex probability amplitudes satisfying:

$$|\\alpha|^2 + |\\beta|^2 = 1$$

## The Power of Superposition
When a qubit is in superposition, it doesn't mean it is somewhere "in between" 0 and 1 in a classical sense; rather, it holds both possibilities simultaneously until a **measurement** occurs.

Upon measurement:
* The probability of observing state `0` is $P(0) = |\\alpha|^2$
* The probability of observing state `1` is $P(1) = |\\beta|^2$

Once measured, the quantum wavefunction **collapses** instantaneously into a classical outcome (`0` or `1`).
""",
        preloaded_circuit=CircuitExecutionRequest(
            qubits=1,
            gates=[
                GateModel(id="g1", gate="H", target=0, step=0)
            ],
            shots=1024
        ),
        quiz=[
            QuizQuestion(
                id="q1",
                question="What condition must probability amplitudes α and β satisfy for a valid qubit state |ψ⟩ = α|0⟩ + β|1⟩?",
                options=[
                    QuizOption(id="a", text="α + β = 1"),
                    QuizOption(id="b", text="|α|² + |β|² = 1"),
                    QuizOption(id="c", text="α * β = 0"),
                    QuizOption(id="d", text="|α| + |β| = 2")
                ],
                correct_option_id="b",
                explanation="The sum of probabilities for all basis states must equal 1, which means |α|² + |β|² = 1."
            )
        ],
        challenge=ChallengeDefinition(
            id="c1",
            title="Create Superposition",
            description="Apply a Hadamard gate to qubit 0 starting from |0⟩ to achieve a 50/50 probability distribution between |0⟩ and |1⟩.",
            initial_qubits=1,
            target_probabilities={"0": 0.5, "1": 0.5},
            allowed_gates=["H", "X", "Y", "Z"],
            hint="The Hadamard (H) gate transforms |0⟩ into (|0⟩ + |1⟩)/√2."
        )
    ),
    
    LessonModule(
        id="circ-1",
        title="Single Qubit Quantum Gates & The Bloch Sphere",
        category="circuits",
        description="Master single-qubit unitary operations: Pauli-X, Y, Z, Hadamard, and Phase Rotation gates.",
        duration_minutes=20,
        difficulty="beginner",
        content_markdown="""# 2. Single-Qubit Quantum Gates

Quantum gates are unitary operators $U$ ($U^\\dagger U = I$) that rotate qubit vectors on the **Bloch Sphere**.

## Common Single-Qubit Gates:
1. **Pauli-X (Bit Flip / Quantum NOT)**:
   $$X = \\begin{pmatrix} 0 & 1 \\\\ 1 & 0 \\end{pmatrix}, \\quad X|0\\rangle = |1\\rangle, \\quad X|1\\rangle = |0\\rangle$$

2. **Hadamard (Superposition Creator)**:
   $$H = \\frac{1}{\\sqrt{2}}\\begin{pmatrix} 1 & 1 \\\\ 1 & -1 \\end{pmatrix}, \\quad H|0\\rangle = |+\\rangle, \\quad H|1\\rangle = |-\\rangle$$

3. **Pauli-Z (Phase Flip)**:
   $$Z = \\begin{pmatrix} 1 & 0 \\\\ 0 & -1 \\end{pmatrix}, \\quad Z|0\\rangle = |0\\rangle, \\quad Z|1\\rangle = -|1\\rangle$$

4. **Rotation Gates $R_x(\\theta), R_y(\\theta), R_z(\\theta)$**:
   Allows precise arbitrary rotation angles around the Bloch sphere axes!
""",
        preloaded_circuit=CircuitExecutionRequest(
            qubits=1,
            gates=[
                GateModel(id="g1", gate="X", target=0, step=0),
                GateModel(id="g2", gate="H", target=0, step=1)
            ],
            shots=1024
        ),
        quiz=[
            QuizQuestion(
                id="q2",
                question="What is the result of applying Pauli-X then Hadamard (H(X|0⟩))?",
                options=[
                    QuizOption(id="a", text="|0⟩"),
                    QuizOption(id="b", text="|1⟩"),
                    QuizOption(id="c", text="|-⟩ = (|0⟩ - |1⟩)/√2"),
                    QuizOption(id="d", text="|+⟩ = (|0⟩ + |1⟩)/√2")
                ],
                correct_option_id="c",
                explanation="X|0⟩ = |1⟩, and applying H to |1⟩ yields |-⟩ = (|0⟩ - |1⟩)/√2."
            )
        ],
        challenge=ChallengeDefinition(
            id="c2",
            title="Prepare the |-⟩ State",
            description="Build a circuit starting from |0⟩ that outputs the |-⟩ state (equal probability 50/50, with a relative phase of π).",
            initial_qubits=1,
            target_probabilities={"0": 0.5, "1": 0.5},
            allowed_gates=["X", "H", "Z"],
            hint="Apply an X gate followed by a Hadamard gate: H(X|0⟩)."
        )
    ),

    LessonModule(
        id="ent-1",
        title="Quantum Entanglement & Bell States",
        category="entanglement",
        description="Explore spooky action at a distance: generate maximally entangled two-qubit Bell states.",
        duration_minutes=25,
        difficulty="intermediate",
        content_markdown="""# 3. Quantum Entanglement & Bell States

**Quantum Entanglement** is a phenomenon where the quantum state of two or more qubits cannot be described independently of each other, regardless of spatial distance.

## Generating the $|\Phi^+\\rangle$ Bell State
To create a Bell state:
1. Apply **Hadamard (H)** on Qubit 0: $|00\\rangle \\rightarrow \\frac{1}{\\sqrt{2}}(|0\\rangle + |1\\rangle)|0\\rangle$
2. Apply **CNOT (Controlled-NOT)** with control $q_0$ and target $q_1$:
   $$|\\Phi^+\\rangle = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}$$

## Key Properties:
* Measuring $q_0$ yields `0` or `1` with equal 50% probability.
* However, if $q_0$ collapses to `0`, $q_1$ instantly collapses to `0` with 100% certainty!
* If $q_0$ collapses to `1`, $q_1$ instantly collapses to `1` with 100% certainty!
""",
        preloaded_circuit=CircuitExecutionRequest(
            qubits=2,
            gates=[
                GateModel(id="g1", gate="H", target=0, step=0),
                GateModel(id="g2", gate="CNOT", target=1, control=0, step=1)
            ],
            shots=1024
        ),
        quiz=[
            QuizQuestion(
                id="q3",
                question="In a maximally entangled Bell state (|00⟩ + |11⟩)/√2, what are the only two measurement outcomes possible?",
                options=[
                    QuizOption(id="a", text="01 and 10"),
                    QuizOption(id="b", text="00 and 11"),
                    QuizOption(id="c", text="00, 01, 10, 11 equally"),
                    QuizOption(id="d", text="Only 00")
                ],
                correct_option_id="b",
                explanation="Because the qubits are correlated in |Φ+⟩, the only non-zero probability amplitudes belong to |00⟩ and |11⟩."
            )
        ],
        challenge=ChallengeDefinition(
            id="c3",
            title="Construct a Bell State",
            description="Use an H gate and a CNOT gate to produce an entangled Bell state with probabilities 50% for |00⟩ and 50% for |11⟩.",
            initial_qubits=2,
            target_probabilities={"00": 0.5, "11": 0.5},
            allowed_gates=["H", "X", "CNOT"],
            hint="Put qubit 0 into superposition with H, then use CNOT with control=0 and target=1."
        )
    ),

    LessonModule(
        id="alg-1",
        title="Grover's Quantum Search Algorithm",
        category="algorithms",
        description="Understand how quantum amplitude amplification searches unsorted databases in O(√N) time.",
        duration_minutes=30,
        difficulty="advanced",
        content_markdown="""# 4. Grover's Quantum Search Algorithm

Classical computers require $O(N)$ operations to search an unstructured database of $N$ items. **Grover's algorithm** achieves quadratic speedup in $O(\\sqrt{N})$ time!

## Algorithm Pipeline:
1. **State Preparation**: Apply $H^{\\otimes n}$ to initialize an equal superposition of all database entries.
2. **Oracle Phase Flip ($U_f$)**: Inverts the phase of the target marked state $|x^*\\rangle \\rightarrow -|x^*\\rangle$.
3. **Diffusion Operator ($U_s$)**: Amplifies the target state's probability amplitude by reflecting about the mean amplitude.
4. **Measurement**: Returns the target marked entry with near 100% probability!
""",
        preloaded_circuit=CircuitExecutionRequest(
            qubits=2,
            gates=[
                GateModel(id="g1", gate="H", target=0, step=0),
                GateModel(id="g2", gate="H", target=1, step=0),
                # Oracle for |11>
                GateModel(id="g3", gate="H", target=1, step=1),
                GateModel(id="g4", gate="CNOT", target=1, control=0, step=2),
                GateModel(id="g5", gate="H", target=1, step=3),
                # Diffusion operator
                GateModel(id="g6", gate="H", target=0, step=4),
                GateModel(id="g7", gate="H", target=1, step=4),
                GateModel(id="g8", gate="X", target=0, step=5),
                GateModel(id="g9", gate="X", target=1, step=5),
                GateModel(id="g10", gate="H", target=1, step=6),
                GateModel(id="g11", gate="CNOT", target=1, control=0, step=7),
                GateModel(id="g12", gate="H", target=1, step=8),
                GateModel(id="g13", gate="X", target=0, step=9),
                GateModel(id="g14", gate="X", target=1, step=9),
                GateModel(id="g15", gate="H", target=0, step=10),
                GateModel(id="g16", gate="H", target=1, step=10)
            ],
            shots=1024
        ),
        quiz=[
            QuizQuestion(
                id="q4",
                question="What is the computational complexity of Grover's search algorithm for N elements?",
                options=[
                    QuizOption(id="a", text="O(N)"),
                    QuizOption(id="b", text="O(log N)"),
                    QuizOption(id="c", text="O(√N)"),
                    QuizOption(id="d", text="O(1)")
                ],
                correct_option_id="c",
                explanation="Grover's algorithm provides quadratic speedup, scaling as O(√N)."
            )
        ],
        challenge=ChallengeDefinition(
            id="c4",
            title="Amplify Target State",
            description="Run the 2-qubit Grover circuit to isolate state |11⟩ with maximum probability.",
            initial_qubits=2,
            target_probabilities={"11": 1.0},
            allowed_gates=["H", "X", "Z", "CNOT"],
            hint="Make sure the oracle and diffusion operators are properly aligned!"
        )
    )
]

def get_all_modules() -> List[LessonModule]:
    return MODULES

def get_module_by_id(module_id: str) -> Optional[LessonModule]:
    for m in MODULES:
        if m.id == module_id:
            return m
    return None
