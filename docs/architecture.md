# Architecture Overview — AI Quantum Computing Learning Platform

## System Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        React + TypeScript Frontend                     │
│  (3D Bloch Sphere, Circuit Timeline, Probability Charts, AI Chat)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST API
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          FastAPI Python Backend                        │
├───────────────────┬─────────────────────┬──────────────────────────────┤
│ Quantum Simulator │ Bloch Vector Math   │ Gemini 2.5 AI Tutor Service │
│ (Qiskit + Numpy)  │ Engine              │ (Circuit Explain & Debug)    │
└───────────────────┴─────────────────────┴──────────────────────────────┘
```

## Backend Services
1. **Quantum Simulation Engine (`app/services/quantum/simulator.py`)**:
   - Executes $N$-qubit circuits using Qiskit Aer / Statevector engine with Numpy fallback matrix multiplication.
   - Computes statevector probability amplitudes $P(k) = |\alpha_k|^2$, shot counts, and execution metrics.

2. **Bloch Vector Math (`app/services/quantum/bloch.py`)**:
   - Computes reduced density matrices $\rho_i = \text{Tr}_{\bar{i}}(|\psi\rangle\langle\psi|)$.
   - Derives Cartesian coordinates $(x, y, z)$ and spherical angles $(\theta, \phi)$ for 3D visualization.

3. **Gemini AI Tutor (`app/services/ai/gemini_service.py`)**:
   - Analyzes current circuit structure and measurement probabilities.
   - Provides explanations, debug advice, optimization tips, and framework code generation.

4. **Curriculum & Assessment (`app/services/learning/` & `app/services/assessment/`)**:
   - Interactive modules for Fundamentals, Circuits, Entanglement, and Algorithms.
   - Automated circuit challenge evaluator measuring quantum state overlap fidelity.
