from pydantic import BaseModel, Field, model_validator
from typing import List, Dict, Optional, Any, Union

class GateModel(BaseModel):
    id: Optional[str] = None
    gate: str = Field(..., description="Gate type: H, X, Y, Z, S, T, RX, RY, RZ, CNOT, SWAP, M")
    target: Optional[int] = Field(None, description="Target qubit index (0-indexed)")
    control: Optional[int] = Field(None, description="Control qubit index for 2-qubit gates")
    params: Optional[Dict[str, float]] = Field(default_factory=dict, description="Parameters like theta for rotation gates")
    step: Optional[int] = Field(0, description="Column/step index in circuit timeline")

    # Extra fields the frontend may send (qubits array, name, targets, etc.)
    qubits: Optional[List[int]] = Field(None, exclude=True)
    name: Optional[str] = Field(None, exclude=True)
    targets: Optional[Any] = Field(None, exclude=True)

    model_config = {"extra": "allow"}

    @model_validator(mode="before")
    @classmethod
    def normalize_gate_fields(cls, values: Any) -> Any:
        if not isinstance(values, dict):
            return values

        # --- normalise gate name ---
        gate_raw = values.get("gate") or values.get("name") or values.get("type") or ""
        gate_upper = str(gate_raw).upper().strip()
        aliases = {"CX": "CNOT", "MEASUREMENT": "M", "MEASURE": "M"}
        gate_upper = aliases.get(gate_upper, gate_upper)
        values["gate"] = gate_upper

        # --- normalise qubits → target / control ---
        qubits = values.get("qubits") or values.get("targets") or values.get("wires")
        if isinstance(qubits, list) and len(qubits) > 0:
            two_qubit_gates = {"CNOT", "CX", "CZ", "SWAP"}
            if gate_upper in two_qubit_gates and len(qubits) >= 2:
                values.setdefault("control", int(qubits[0]))
                values.setdefault("target", int(qubits[1]))
            else:
                values.setdefault("target", int(qubits[0]))

        # If target is still missing, try 'qubit' field
        if values.get("target") is None:
            if "qubit" in values:
                values["target"] = int(values["qubit"])
            else:
                values["target"] = 0

        # --- normalise params ---
        raw_params = values.get("params")
        if isinstance(raw_params, list):
            # Convert [3.14] → {"theta": 3.14}
            if len(raw_params) > 0:
                values["params"] = {"theta": float(raw_params[0])}
            else:
                values["params"] = {}
        elif raw_params is None:
            values["params"] = {}

        return values

class CircuitExecutionRequest(BaseModel):
    qubits: int = Field(default=2, ge=1, le=10, description="Number of qubits in circuit (1 to 10)")
    initial_states: Optional[List[str]] = Field(default=None, description="Initial bit state for each qubit ('0' or '1')")
    gates: List[GateModel] = Field(default_factory=list)
    shots: int = Field(default=1024, ge=1, le=8192)
    backend: str = Field(default="qiskit_aer", description="Quantum simulator backend")

    model_config = {"extra": "allow"}

    @model_validator(mode="before")
    @classmethod
    def normalize_circuit_fields(cls, values: Any) -> Any:
        if not isinstance(values, dict):
            return values

        # If the payload wraps everything inside a "circuit" key, flatten it
        if "circuit" in values and isinstance(values["circuit"], dict):
            circuit_data = values.pop("circuit")
            # Merge circuit fields into top level (don't overwrite existing keys)
            for k, v in circuit_data.items():
                values.setdefault(k, v)

        # Accept num_qubits as an alias for qubits
        if "num_qubits" in values and "qubits" not in values:
            values["qubits"] = values.pop("num_qubits")
        elif "num_qubits" in values:
            values.pop("num_qubits", None)

        return values

class BlochSphereVector(BaseModel):
    qubit_index: int
    x: float
    y: float
    z: float
    theta: float
    phi: float
    state_str: str
    prob_0: float
    prob_1: float

class ComplexNumber(BaseModel):
    real: float
    imag: float
    magnitude: float
    phase: float

class StepStateResult(BaseModel):
    step: int
    description: str
    statevector: List[ComplexNumber]
    bloch_vectors: List[BlochSphereVector]
    probabilities: Dict[str, float]

class SimulationResultResponse(BaseModel):
    counts: Dict[str, int]
    probabilities: Dict[str, float]
    statevector: Optional[List[ComplexNumber]] = None
    bloch_vectors: List[BlochSphereVector]
    num_qubits: int
    shots: int
    execution_time_ms: float
    step_results: Optional[List[StepStateResult]] = None
    qiskit_code: str
    pennylane_code: str
    cirq_code: str

# AI Schemas
class AICircuitExplainRequest(BaseModel):
    circuit: CircuitExecutionRequest
    simulation_result: Optional[Dict[str, Any]] = None
    action_type: str = Field(default="explain", description="explain, debug, optimize, why_result")
    custom_question: Optional[str] = None

    model_config = {"extra": "allow"}

    @model_validator(mode="before")
    @classmethod
    def normalize_explain_fields(cls, values: Any) -> Any:
        if not isinstance(values, dict):
            return values
        # Accept sim_result as alias
        if "sim_result" in values and "simulation_result" not in values:
            values["simulation_result"] = values.pop("sim_result")
        # Accept action as alias
        if "action" in values and "action_type" not in values:
            values["action_type"] = values.pop("action")
        return values

class AIChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None
    conversation_history: Optional[List[Dict[str, str]]] = None

class AIChatResponse(BaseModel):
    reply: str
    suggested_actions: Optional[List[str]] = None
    suggested_circuit: Optional[CircuitExecutionRequest] = None

class AICodeGenRequest(BaseModel):
    circuit: CircuitExecutionRequest
    framework: str = Field(default="qiskit", description="qiskit, pennylane, cirq, latex")

class AICodeGenResponse(BaseModel):
    code: str
    framework: str
    explanation: str

# Learning Schemas
class QuizOption(BaseModel):
    id: str
    text: str

class QuizQuestion(BaseModel):
    id: str
    question: str
    options: List[QuizOption]
    correct_option_id: str
    explanation: str

class ChallengeDefinition(BaseModel):
    id: str
    title: str
    description: str
    initial_qubits: int
    target_probabilities: Dict[str, float]
    allowed_gates: List[str]
    hint: str

class LessonModule(BaseModel):
    id: str
    title: str
    category: str  # fundamentals, circuits, entanglement, algorithms
    description: str
    duration_minutes: int
    difficulty: str  # beginner, intermediate, advanced
    content_markdown: str
    preloaded_circuit: Optional[CircuitExecutionRequest] = None
    quiz: Optional[List[QuizQuestion]] = None
    challenge: Optional[ChallengeDefinition] = None

class AssessmentSubmitRequest(BaseModel):
    challenge_id: str
    circuit: CircuitExecutionRequest

    model_config = {"extra": "allow"}

    @model_validator(mode="before")
    @classmethod
    def normalize_assessment_fields(cls, values: Any) -> Any:
        if not isinstance(values, dict):
            return values
        if "challengeId" in values and "challenge_id" not in values:
            values["challenge_id"] = values.pop("challengeId")
        return values

class AssessmentResultResponse(BaseModel):
    passed: bool
    score: int
    feedback: str
    expected_probabilities: Dict[str, float]
    actual_probabilities: Dict[str, float]
    fidelity: float

# Demo Schemas
class PreloadedDemo(BaseModel):
    id: str
    name: str
    description: str
    category: str
    circuit: CircuitExecutionRequest
    key_takeaway: str
    concept: Optional[str] = None
    theory: Optional[str] = None
