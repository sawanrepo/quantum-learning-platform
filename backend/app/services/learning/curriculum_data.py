from typing import List, Dict, Optional
from app.schemas.schemas import LessonModule, CircuitExecutionRequest, GateModel, QuizQuestion, QuizOption, ChallengeDefinition

MODULES: List[LessonModule] = [
    # -------------------------------------------------------------
    # 1. Classical Bits vs. Quantum Qubits
    # -------------------------------------------------------------
    LessonModule(
        id="fund-1",
        title="Classical Bits vs. Quantum Qubits",
        category="fundamentals",
        description="Discover the core building block of quantum information processing: the Qubit and state superposition.",
        duration_minutes=15,
        difficulty="beginner",
        content_markdown=r"""# 1. Classical Bits vs. Quantum Qubits

In classical computing, the fundamental unit of information is a **bit**, which can strictly be in state `0` or `1`.

In **quantum computing**, the fundamental unit is a **qubit** (quantum bit). A qubit's state $|\psi\rangle$ is described mathematically as a linear combination (superposition) of basis states $|0\rangle$ and $|1\rangle$:

$$|\psi\rangle = \alpha |0\rangle + \beta |1\rangle$$

where $\alpha, \beta \in \mathbb{C}$ are complex probability amplitudes satisfying the normalization condition:

$$|\alpha|^2 + |\beta|^2 = 1$$

## The Power of Superposition
When a qubit is in superposition, it doesn't mean it is somewhere "in between" 0 and 1 in a classical sense; rather, it holds both possibilities simultaneously until a **measurement** occurs.

Upon measurement:
* The probability of observing state `0` is $P(0) = |\alpha|^2$
* The probability of observing state `1` is $P(1) = |\beta|^2$

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
    
    # -------------------------------------------------------------
    # 2. Single-Qubit Quantum Gates & The Bloch Sphere
    # -------------------------------------------------------------
    LessonModule(
        id="circ-1",
        title="Single Qubit Quantum Gates & The Bloch Sphere",
        category="circuits",
        description="Master single-qubit unitary operations: Pauli-X, Y, Z, Hadamard, and Phase Rotation gates.",
        duration_minutes=20,
        difficulty="beginner",
        content_markdown=r"""# 2. Single-Qubit Quantum Gates

Quantum gates are unitary operators $U$ ($U^\dagger U = I$) that rotate qubit state vectors on the **Bloch Sphere**.

## Common Single-Qubit Gates:
1. **Pauli-X (Bit Flip / Quantum NOT)**:
   $$X = \begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}, \quad X|0\rangle = |1\rangle, \quad X|1\rangle = |0\rangle$$

2. **Hadamard (Superposition Creator)**:
   $$H = \frac{1}{\sqrt{2}}\begin{pmatrix} 1 & 1 \\ 1 & -1 \end{pmatrix}, \quad H|0\rangle = |+\rangle = \frac{|0\rangle + |1\rangle}{\sqrt{2}}, \quad H|1\rangle = |-\rangle = \frac{|0\rangle - |1\rangle}{\sqrt{2}}$$

3. **Pauli-Z (Phase Flip)**:
   $$Z = \begin{pmatrix} 1 & 0 \\ 0 & -1 \end{pmatrix}, \quad Z|0\rangle = |0\rangle, \quad Z|1\rangle = -|1\rangle$$

4. **Phase Gates (S and T)**:
   $$S = \begin{pmatrix} 1 & 0 \\ 0 & i \end{pmatrix} = R_z(\pi/2), \quad T = \begin{pmatrix} 1 & 0 \\ 0 & e^{i\pi/4} \end{pmatrix} = R_z(\pi/4)$$

5. **Rotation Gates $R_x(\theta), R_y(\theta), R_z(\theta)$**:
   Allow continuous, arbitrary angle rotations around the orthogonal Bloch axes.
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

    # -------------------------------------------------------------
    # 3. Multi-Qubit Gates & Reversible Logic
    # -------------------------------------------------------------
    LessonModule(
        id="circ-2",
        title="Multi-Qubit Gates & Reversible Logic",
        category="circuits",
        description="Understand two-qubit entangling gates, matrix tensor products, and Landauer's reversible computing principle.",
        duration_minutes=25,
        difficulty="intermediate",
        content_markdown=r"""# 3. Multi-Qubit Gates & Reversible Logic

In multi-qubit systems, the joint quantum state space is the **tensor product** ($\otimes$) of individual qubit Hilbert spaces. For $n$ qubits, the state space dimension is $2^n$!

## The CNOT Gate (Controlled-NOT)
The CNOT gate acts on two qubits: a **control** qubit and a **target** qubit.
* If control is $|0\rangle$, target remains unchanged.
* If control is $|1\rangle$, target is flipped ($X$ applied).

$$CNOT = \begin{pmatrix} 1 & 0 & 0 & 0 \\ 0 & 1 & 0 & 0 \\ 0 & 0 & 0 & 1 \\ 0 & 0 & 1 & 0 \end{pmatrix}$$

## Reversible Computing & Landauer's Principle
Classical gates like AND or OR destroy information (taking 2 bits in and giving 1 bit out), which by **Landauer's Principle** requires dissipating heat:

$$\Delta Q \ge k_B T \ln 2$$

Quantum computing is strictly **unitary** ($U^\dagger U = I$), which means every quantum circuit operation is completely **reversible** and preserves all quantum information!

## Constructing a SWAP Gate
A SWAP gate exchanges the states of two qubits. Remarkably, it can be constructed using **three alternating CNOT gates**:

$$SWAP = CNOT_{0\to 1} \cdot CNOT_{1\to 0} \cdot CNOT_{0\to 1}$$
""",
        preloaded_circuit=CircuitExecutionRequest(
            qubits=2,
            gates=[
                GateModel(id="g1", gate="X", target=0, step=0),
                # 3-CNOT SWAP
                GateModel(id="g2", gate="CNOT", target=1, control=0, step=1),
                GateModel(id="g3", gate="CNOT", target=0, control=1, step=2),
                GateModel(id="g4", gate="CNOT", target=1, control=0, step=3)
            ],
            shots=1024
        ),
        quiz=[
            QuizQuestion(
                id="q_circ2",
                question="How many CNOT gates are required to construct an equivalent SWAP gate between two qubits?",
                options=[
                    QuizOption(id="a", text="1"),
                    QuizOption(id="b", text="2"),
                    QuizOption(id="c", text="3"),
                    QuizOption(id="d", text="4")
                ],
                correct_option_id="c",
                explanation="A SWAP gate between two qubits is constructed using exactly 3 alternating CNOT gates: CX(0,1), CX(1,0), CX(0,1)."
            )
        ],
        challenge=ChallengeDefinition(
            id="c_swap",
            title="Implement the SWAP Gate",
            description="Starting with qubit 0 set to |1⟩ and qubit 1 set to |0⟩, use CNOT gates to swap their states so the output is |01⟩ (100% on state '01').",
            initial_qubits=2,
            target_probabilities={"01": 1.0},
            allowed_gates=["X", "CNOT", "H"],
            hint="Set qubit 0 to |1⟩ with an X gate, then apply 3 alternating CNOTs: CX(0->1), CX(1->0), CX(0->1)."
        )
    ),

    # -------------------------------------------------------------
    # 4. Quantum Entanglement & Bell States
    # -------------------------------------------------------------
    LessonModule(
        id="ent-1",
        title="Quantum Entanglement & Bell States",
        category="entanglement",
        description="Explore spooky action at a distance: generate maximally entangled two-qubit Bell states.",
        duration_minutes=25,
        difficulty="intermediate",
        content_markdown=r"""# 4. Quantum Entanglement & Bell States

**Quantum Entanglement** is a phenomenon where the quantum state of two or more qubits cannot be factored into product states of individual qubits:

$$|\psi_{AB}\rangle \ne |\psi_A\rangle \otimes |\psi_B\rangle$$

## Generating the $|\Phi^+\rangle$ Bell State
To create the canonical Bell state:
1. Apply **Hadamard (H)** on Qubit 0:
   $$|00\rangle \xrightarrow{H_0} \frac{|0\rangle + |1\rangle}{\sqrt{2}} |0\rangle = \frac{|00\rangle + |10\rangle}{\sqrt{2}}$$
2. Apply **CNOT** with control $q_0$ and target $q_1$:
   $$|\Phi^+\rangle = \frac{|00\rangle + |11\rangle}{\sqrt{2}}$$

## Key Properties:
* Measuring $q_0$ yields `0` or `1` with equal 50% probability.
* However, if $q_0$ collapses to `0`, $q_1$ instantly collapses to `0` with 100% certainty!
* If $q_0$ collapses to `1`, $q_1$ instantly collapses to `1` with 100% certainty!
* This non-local correlation persists even if the qubits are light-years apart.
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

    # -------------------------------------------------------------
    # 5. The Four Bell States & Superdense Coding
    # -------------------------------------------------------------
    LessonModule(
        id="ent-2",
        title="The Four Bell States & Superdense Coding",
        category="entanglement",
        description="Master the complete orthonormal Bell basis and transmit two classical bits using a single physical qubit.",
        duration_minutes=30,
        difficulty="intermediate",
        content_markdown=r"""# 5. The Four Bell States & Superdense Coding

The two-qubit Hilbert space has an orthonormal basis of **four maximally entangled Bell states**:

$$|\Phi^+\rangle = \frac{|00\rangle + |11\rangle}{\sqrt{2}}, \quad |\Phi^-\rangle = \frac{|00\rangle - |11\rangle}{\sqrt{2}}$$
$$|\Psi^+\rangle = \frac{|01\rangle + |10\rangle}{\sqrt{2}}, \quad |\Psi^-\rangle = \frac{|01\rangle - |10\rangle}{\sqrt{2}}$$

Any of these four states can be converted into any other by applying single-qubit gates ($I, Z, X, XZ$) to **only one** of the qubits!

## Superdense Coding Protocol
Superdense coding allows Alice to transmit **2 classical bits** to Bob by sending only **1 physical qubit**:

1. **Shared Entanglement**: Alice and Bob pre-share a Bell pair $|\Phi^+\rangle_{AB}$.
2. **Alice's Encoding**: To send classical bits $b_1 b_0$, Alice applies a gate to her qubit $q_A$:
   * `00` $\rightarrow$ Apply $I$ (leaves state $|\Phi^+\rangle$)
   * `01` $\rightarrow$ Apply $Z$ (yields $|\Phi^-\rangle$)
   * `10` $\rightarrow$ Apply $X$ (yields $|\Psi^+\rangle$)
   * `11` $\rightarrow$ Apply $XZ$ (yields $|\Psi^-\rangle$)
3. **Transmission**: Alice sends her single qubit $q_A$ to Bob.
4. **Bob's Bell Measurement**: Bob applies $CNOT(q_A, q_B)$ followed by $H(q_A)$ and measures both qubits in the computational basis, reading out $b_1 b_0$ with 100% determinism!
""",
        preloaded_circuit=CircuitExecutionRequest(
            qubits=2,
            gates=[
                # Prepare shared Bell state
                GateModel(id="g1", gate="H", target=0, step=0),
                GateModel(id="g2", gate="CNOT", target=1, control=0, step=1),
                # Alice encodes '11' using Z then X on qubit 0
                GateModel(id="g3", gate="Z", target=0, step=2),
                GateModel(id="g4", gate="X", target=0, step=3),
                # Bob decodes using CNOT and H
                GateModel(id="g5", gate="CNOT", target=1, control=0, step=4),
                GateModel(id="g6", gate="H", target=0, step=5)
            ],
            shots=1024
        ),
        quiz=[
            QuizQuestion(
                id="q_sdc",
                question="How many classical bits can be transmitted by sending 1 qubit using Superdense Coding with a pre-shared Bell pair?",
                options=[
                    QuizOption(id="a", text="1 bit"),
                    QuizOption(id="b", text="2 bits"),
                    QuizOption(id="c", text="4 bits"),
                    QuizOption(id="d", text="Infinite bits")
                ],
                correct_option_id="b",
                explanation="Superdense coding doubles channel capacity: sending 1 physical qubit transfers 2 classical bits by leveraging pre-shared entanglement."
            )
        ],
        challenge=ChallengeDefinition(
            id="c_bell4",
            title="Generate the |Ψ-⟩ Singlet State",
            description="Build a circuit that prepares the anti-symmetric singlet Bell state (|01⟩ - |10⟩)/√2 with equal 50% probability on '01' and '10'.",
            initial_qubits=2,
            target_probabilities={"01": 0.5, "10": 0.5},
            allowed_gates=["H", "X", "Z", "CNOT"],
            hint="Create |Φ+⟩ with H and CNOT, then apply X followed by Z on qubit 0."
        )
    ),

    # -------------------------------------------------------------
    # 6. Grover's Quantum Search Algorithm
    # -------------------------------------------------------------
    LessonModule(
        id="alg-1",
        title="Grover's Quantum Search Algorithm",
        category="algorithms",
        description="Understand how quantum amplitude amplification searches unsorted databases in O(√N) time.",
        duration_minutes=30,
        difficulty="advanced",
        content_markdown=r"""# 6. Grover's Quantum Search Algorithm

Classical computers require $O(N)$ operations to search an unstructured database of $N$ items. **Grover's algorithm** achieves quadratic speedup in $O(\sqrt{N})$ time!

## Algorithm Pipeline:
1. **State Preparation**: Apply $H^{\otimes n}$ to initialize an equal superposition of all database entries.
2. **Oracle Phase Inversion ($U_f$)**: Inverts the phase of the target marked state:
   $$|x^*\rangle \rightarrow -|x^*\rangle$$
3. **Diffusion Operator ($U_s$)**: Reflects all amplitude vectors about the average mean amplitude:
   $$U_s = 2|\psi_0\rangle\langle\psi_0| - I = H^{\otimes n}(2|0\rangle\langle 0| - I)H^{\otimes n}$$
4. **Measurement**: Constructive interference boosts the target state's amplitude while destructive interference suppresses non-target entries!
""",
        preloaded_circuit=CircuitExecutionRequest(
            qubits=2,
            gates=[
                GateModel(id="g1", gate="H", target=0, step=0),
                GateModel(id="g2", gate="H", target=1, step=0),
                # Oracle for |11> (Controlled-Z via H-CNOT-H)
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
    ),

    # -------------------------------------------------------------
    # 7. Deutsch-Jozsa Quantum Algorithm
    # -------------------------------------------------------------
    LessonModule(
        id="alg-2",
        title="Deutsch-Jozsa Algorithm & Phase Kickback",
        category="algorithms",
        description="Discover the first quantum algorithm demonstrating exponential speedup over deterministic classical computation.",
        duration_minutes=25,
        difficulty="intermediate",
        content_markdown=r"""# 7. Deutsch-Jozsa Algorithm & Phase Kickback

The **Deutsch-Jozsa algorithm** was historically the first algorithm proving that a quantum computer could solve a problem exponentially faster than any deterministic classical computer.

## Problem Formulation
Given a Boolean function $f: \{0,1\}^n \rightarrow \{0,1\}$, we are promised that $f$ is either:
1. **Constant**: returns the same output (always 0 or always 1) for all inputs.
2. **Balanced**: returns 0 for exactly half the inputs and 1 for the other half.

## Classical vs. Quantum Query Complexity
* **Classical Deterministic**: in the worst case, requires checking over half the inputs: $2^{n-1} + 1$ queries!
* **Quantum**: Solves the problem with **a single query ($O(1)$)** using quantum superposition and phase kickback!

## Phase Kickback Mechanism
When an ancilla qubit in state $|-\rangle = (|0\rangle - |1\rangle)/\sqrt{2}$ is used as the target of $U_f |x\rangle|y\rangle = |x\rangle|y \oplus f(x)\rangle$:

$$|x\rangle|-\rangle \xrightarrow{U_f} (-1)^{f(x)} |x\rangle|-\rangle$$

The eigenvalue $(-1)^{f(x)}$ is "kicked back" into the phase of the input register!
""",
        preloaded_circuit=CircuitExecutionRequest(
            qubits=2,
            gates=[
                # Ancilla q1 prepared in |1> then |->
                GateModel(id="g1", gate="X", target=1, step=0),
                # Superposition on both qubits
                GateModel(id="g2", gate="H", target=0, step=1),
                GateModel(id="g3", gate="H", target=1, step=1),
                # Balanced Oracle: CNOT(0->1)
                GateModel(id="g4", gate="CNOT", target=1, control=0, step=2),
                # Interfere input qubit
                GateModel(id="g5", gate="H", target=0, step=3)
            ],
            shots=1024
        ),
        quiz=[
            QuizQuestion(
                id="q_dj",
                question="How many queries does the Deutsch-Jozsa algorithm require to determine if f is constant or balanced?",
                options=[
                    QuizOption(id="a", text="1 query"),
                    QuizOption(id="b", text="2^(n-1) + 1 queries"),
                    QuizOption(id="c", text="n queries"),
                    QuizOption(id="d", text="n/2 queries")
                ],
                correct_option_id="a",
                explanation="The Deutsch-Jozsa algorithm evaluates whether f is constant or balanced with exactly 1 query to the quantum oracle."
            )
        ],
        challenge=ChallengeDefinition(
            id="c_dj",
            title="Demonstrate Phase Kickback",
            description="Build a 2-qubit circuit where applying CNOT from control q0 to an ancilla q1 in |-⟩ kicks back a -1 phase to q0, measuring |1⟩ on q0.",
            initial_qubits=2,
            target_probabilities={"11": 0.5, "10": 0.5},
            allowed_gates=["H", "X", "CNOT"],
            hint="Put q1 in |-> using X and H. Put q0 in |+> using H. Apply CNOT(0->1), then H on q0."
        )
    ),

    # -------------------------------------------------------------
    # 8. Quantum Fourier Transform (QFT)
    # -------------------------------------------------------------
    LessonModule(
        id="alg-3",
        title="Quantum Fourier Transform (QFT)",
        category="algorithms",
        description="Master the algorithmic engine powering Shor's factoring algorithm and quantum phase estimation.",
        duration_minutes=35,
        difficulty="advanced",
        content_markdown=r"""# 8. Quantum Fourier Transform (QFT)

The **Quantum Fourier Transform** is the quantum analog of the discrete Fourier transform. It transforms computational basis amplitudes into phase basis frequencies:

$$|j\rangle \mapsto \frac{1}{\sqrt{N}} \sum_{k=0}^{N-1} e^{2\pi i j k / N} |k\rangle$$

## Algorithmic Importance
The classical Fast Fourier Transform (FFT) requires $O(n 2^n)$ operations on $N = 2^n$ amplitudes.
The Quantum Fourier Transform computes this transformation in **$O(n^2)$ quantum gates** — an exponential speedup!

QFT serves as the computational core of:
* **Shor's Algorithm** for prime factorization and breaking RSA cryptography.
* **Quantum Phase Estimation (QPE)** for finding eigenvalues of unitaries in quantum chemistry and materials simulation.
* **Order-finding and discrete logarithm algorithms**.

## 2-Qubit QFT Circuit Architecture:
1. $H$ gate on qubit 0.
2. Controlled-$S$ ($R_z(\pi/2)$) gate from qubit 1 to qubit 0.
3. $H$ gate on qubit 1.
4. SWAP gate between qubit 0 and qubit 1 to reverse output endianness.
""",
        preloaded_circuit=CircuitExecutionRequest(
            qubits=2,
            gates=[
                # Input state |01> (q1=1, q0=0)
                GateModel(id="g1", gate="X", target=1, step=0),
                # QFT on 2 qubits
                GateModel(id="g2", gate="H", target=0, step=1),
                GateModel(id="g3", gate="RZ", target=0, params={"theta": 1.5708}, step=2),
                GateModel(id="g4", gate="H", target=1, step=3),
                GateModel(id="g5", gate="SWAP", target=1, control=0, step=4)
            ],
            shots=1024
        ),
        quiz=[
            QuizQuestion(
                id="q_qft",
                question="What is the gate complexity of the Quantum Fourier Transform on n qubits?",
                options=[
                    QuizOption(id="a", text="O(n²)"),
                    QuizOption(id="b", text="O(2^n)"),
                    QuizOption(id="c", text="O(n 2^n)"),
                    QuizOption(id="d", text="O(n)")
                ],
                correct_option_id="a",
                explanation="The QFT requires only O(n²) gates (specifically n(n+1)/2 Hadamard and controlled-rotation gates)."
            )
        ],
        challenge=ChallengeDefinition(
            id="c_qft",
            title="Uniform Phase Superposition via QFT",
            description="Apply the 2-qubit QFT starting from |00⟩ so that all 4 computational states (|00⟩, |01⟩, |10⟩, |11⟩) have equal 25% probability.",
            initial_qubits=2,
            target_probabilities={"00": 0.25, "01": 0.25, "10": 0.25, "11": 0.25},
            allowed_gates=["H", "RZ", "SWAP", "CNOT"],
            hint="Applying QFT to |00⟩ creates an equal superposition over all basis states with zero relative phase."
        )
    ),

    # -------------------------------------------------------------
    # 9. Quantum Cryptography & The BB84 Protocol
    # -------------------------------------------------------------
    LessonModule(
        id="crypt-1",
        title="BB84 Quantum Key Distribution",
        category="cryptography",
        description="Learn how quantum physics guarantees unbreakable cryptographic communication through the BB84 protocol.",
        duration_minutes=20,
        difficulty="beginner",
        content_markdown=r"""# 9. BB84 Quantum Key Distribution

Invented by Charles Bennett and Gilles Brassard in 1984, **BB84** was the world's first **Quantum Key Distribution (QKD)** protocol.

## Why Classical Cryptography is Vulnerable
Classical public-key cryptosystems (like RSA and ECC) rely on the unproven mathematical difficulty of factoring or discrete logarithms, which quantum computers break using Shor's algorithm.

In contrast, BB84 security is guaranteed by the fundamental laws of **quantum mechanics**:
1. **No-Cloning Theorem**: An unknown quantum state cannot be copied.
2. **Heisenberg Uncertainty Principle**: Measuring a quantum system in one basis inherently disturbs any conjugate basis.

## The Protocol Steps:
1. **Alice's Preparation**: For each bit, Alice randomly chooses a bit value (`0` or `1`) and a basis:
   * **Computational ($Z$) Basis**: $\{|0\rangle, |1\rangle\}$
   * **Hadamard ($X$) Basis**: $\{|+\rangle, |-\rangle\}$
2. **Bob's Measurement**: Bob randomly chooses $Z$ or $X$ basis to measure each incoming qubit.
3. **Sifting**: Alice and Bob publicly announce their chosen bases over a classical channel and keep only the bits where their bases matched.
4. **Eavesdropper (Eve) Detection**: If Eve attempts to intercept and measure qubits, she introduces an observable **Quantum Bit Error Rate (QBER)** of $\ge 25\%$, immediately exposing her presence!
""",
        preloaded_circuit=CircuitExecutionRequest(
            qubits=2,
            gates=[
                # Alice encodes bit 1 in X-basis: |1> -> H -> |->
                GateModel(id="g1", gate="X", target=0, step=0),
                GateModel(id="g2", gate="H", target=0, step=1),
                # Bob measures in matching X-basis: H -> measurement
                GateModel(id="g3", gate="H", target=0, step=2),
                GateModel(id="g4", gate="M", target=0, step=3)
            ],
            shots=1024
        ),
        quiz=[
            QuizQuestion(
                id="q_bb84",
                question="What fundamental quantum physical principle prevents an eavesdropper from cloning qubits unnoticed in BB84?",
                options=[
                    QuizOption(id="a", text="The No-Cloning Theorem"),
                    QuizOption(id="b", text="Quantum Superdense Coding"),
                    QuizOption(id="c", text="Bremermann's Limit"),
                    QuizOption(id="d", text="Moore's Law")
                ],
                correct_option_id="a",
                explanation="The No-Cloning theorem proves it is mathematically impossible to create an identical copy of an arbitrary unknown quantum state."
            )
        ],
        challenge=ChallengeDefinition(
            id="c_bb84",
            title="Conjugate Basis Encoding",
            description="Encode qubit 0 in the Hadamard basis state |+⟩, then simulate Bob measuring in the conjugate Z-basis (50/50 probability on |0⟩ and |1⟩).",
            initial_qubits=1,
            target_probabilities={"0": 0.5, "1": 0.5},
            allowed_gates=["H", "X", "Z"],
            hint="Apply an H gate to |0⟩ to prepare |+⟩. Measuring in the computational Z basis gives 50% 0 and 50% 1."
        )
    ),

    # -------------------------------------------------------------
    # 10. Quantum Error Correction & Bit-Flip Code
    # -------------------------------------------------------------
    LessonModule(
        id="err-1",
        title="Quantum Error Correction & 3-Qubit Code",
        category="error_correction",
        description="Discover how quantum error correction shields delicate quantum information against decoherence without destroying superposition.",
        duration_minutes=30,
        difficulty="advanced",
        content_markdown=r"""# 10. Quantum Error Correction & The 3-Qubit Code

Quantum computers are exceptionally sensitive to environmental noise, phase damping, and thermal **decoherence**.

## The Challenge of Quantum Error Correction:
Classical error correction duplicates bits (`0` $\to$ `000`, `1` $\to$ `111`). But in quantum computing:
1. **No-Cloning Theorem**: We cannot copy an unknown quantum state $|\psi\rangle \to |\psi\rangle|\psi\rangle|\psi\rangle$.
2. **Measurement Collapse**: Measuring qubits directly to detect errors would collapse their superposition state!
3. **Continuous Errors**: Quantum errors include continuous phase rotations $e^{i\theta Z}$, not just discrete bit flips.

## The 3-Qubit Bit-Flip Repetition Code
To protect state $|\psi\rangle = \alpha|0\rangle + \beta|1\rangle$, we use **quantum entanglement** to encode 1 logical qubit into 3 physical qubits:

$$|\psi_L\rangle = \alpha|000\rangle + \beta|111\rangle$$

Encoding Circuit:
1. $CNOT(q_0 \to q_1)$
2. $CNOT(q_0 \to q_2)$

## Syndrome Measurement:
By measuring parity operators $Z_0 Z_1$ and $Z_1 Z_2$ using ancilla qubits, we can identify **which** physical qubit flipped without learning anything about the amplitudes $\alpha$ and $\beta$, preserving the logical quantum superposition intact!
""",
        preloaded_circuit=CircuitExecutionRequest(
            qubits=3,
            gates=[
                # Prepare logical qubit in superposition on q0: H
                GateModel(id="g1", gate="H", target=0, step=0),
                # Encode into 3-qubit repetition code
                GateModel(id="g2", gate="CNOT", target=1, control=0, step=1),
                GateModel(id="g3", gate="CNOT", target=2, control=0, step=2),
                # Environmental noise: bit-flip error X on qubit 1!
                GateModel(id="g4", gate="X", target=1, step=3)
            ],
            shots=1024
        ),
        quiz=[
            QuizQuestion(
                id="q_qec",
                question="Why can't quantum error correction simply duplicate qubits like classical repetition codes?",
                options=[
                    QuizOption(id="a", text="The No-Cloning Theorem forbids copying unknown quantum states"),
                    QuizOption(id="b", text="Qubits cannot be entangled"),
                    QuizOption(id="c", text="Classical codes are already 100% efficient"),
                    QuizOption(id="d", text="Gates require too much power")
                ],
                correct_option_id="a",
                explanation="The No-Cloning theorem fundamentally forbids copying an arbitrary quantum state without measuring and destroying it."
            )
        ],
        challenge=ChallengeDefinition(
            id="c_qec",
            title="3-Qubit Logical State Encoding",
            description="Encode a logical qubit in equal superposition into the 3-qubit GHZ repetition state (|000⟩ + |111⟩)/√2 (50% on |000⟩ and 50% on |111⟩).",
            initial_qubits=3,
            target_probabilities={"000": 0.5, "111": 0.5},
            allowed_gates=["H", "CNOT", "X"],
            hint="Apply H to qubit 0, then CNOT from 0 to 1, and CNOT from 0 to 2."
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
