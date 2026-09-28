import os
import json
from typing import Dict, Any, Optional, List
from app.config.settings import settings
from app.schemas.schemas import (
    CircuitExecutionRequest,
    AIChatResponse,
    AICodeGenResponse
)

# Use official google-genai SDK
GENAI_SDK_AVAILABLE = False
try:
    from google import genai
    GENAI_SDK_AVAILABLE = True
except Exception:
    GENAI_SDK_AVAILABLE = False


def _get_gemini_client():
    if not GENAI_SDK_AVAILABLE or not settings.GEMINI_API_KEY:
        return None
    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        return client
    except Exception as e:
        print(f"Error initializing Gemini SDK client: {e}")
        return None


async def explain_quantum_circuit(
    circuit: CircuitExecutionRequest,
    simulation_result: Optional[Dict[str, Any]] = None,
    action_type: str = "explain",
    custom_question: Optional[str] = None
) -> str:
    """
    Explain, debug, optimize or answer questions about a quantum circuit using Google Gemini API.
    """
    client = _get_gemini_client()
    
    # Construct context representation of the circuit
    gate_summary = []
    for g in sorted(circuit.gates, key=lambda x: x.step or 0):
        if g.control is not None:
            gate_summary.append(f"Step {g.step}: Gate '{g.gate}' with Control qubit {g.control} and Target qubit {g.target}")
        else:
            gate_summary.append(f"Step {g.step}: Gate '{g.gate}' on Target qubit {g.target}")
            
    circuit_text = f"Number of Qubits: {circuit.qubits}\n" + "\n".join(gate_summary)
    
    probs_text = ""
    if simulation_result and "probabilities" in simulation_result:
        probs_text = "\nMeasurement Probabilities: " + json.dumps(simulation_result["probabilities"])
        
    prompt = f"""You are QuantumMind AI, a world-class Quantum Computing Professor and Scientist.
Analyze the following quantum circuit and simulation data:

[CIRCUIT DEFINITION]
{circuit_text}
{probs_text}

[USER TASK / QUESTION]
Action Type: {action_type}
Custom Prompt: {custom_question or "Explain the quantum mechanical principles occurring in this circuit, including superposition, phase shifts, or entanglement if present."}

Please structure your response cleanly with clear markdown formatting:
1. **Circuit Architecture Overview**
2. **Quantum Mechanics Principles at Play** (e.g. Hadamard superposition, CNOT entanglement, phase rotation)
3. **Simulation Output Breakdown** (explain why the probabilities were obtained)
4. **Practical Application / Key Insight**
"""

    if client:
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            if response and response.text:
                return response.text
        except Exception as e:
            print(f"Gemini API call failed: {e}. Falling back to rule-based explanation.")

    # Rule-based intelligent fallback explanation if GEMINI_API_KEY is not configured yet
    return _generate_fallback_explanation(circuit, simulation_result, action_type, custom_question)


def _generate_fallback_explanation(
    circuit: CircuitExecutionRequest,
    simulation_result: Optional[Dict[str, Any]],
    action_type: str,
    custom_question: Optional[str]
) -> str:
    gates = [g.gate.upper() for g in circuit.gates]
    has_h = "H" in gates
    has_cnot = "CNOT" in gates or "CX" in gates
    has_x = "X" in gates
    
    explanation = []
    explanation.append("### ⚛️ Quantum Circuit Analysis")
    explanation.append(f"This **{circuit.qubits}-qubit circuit** contains **{len(circuit.gates)} operations**.")
    
    if has_h and has_cnot:
        explanation.append("\n#### 🔗 Entanglement Detected (Bell State)")
        explanation.append("• The **Hadamard (H)** gate creates an equal superposition: $|0\\rangle \\rightarrow \\frac{1}{\\sqrt{2}}(|0\\rangle + |1\\rangle)$.")
        explanation.append("• The subsequent **CNOT** gate entangles qubit 0 and qubit 1, producing a correlated Bell state: \\frac{1}{\\sqrt{2}}(|00\\rangle + |11\\rangle).")
        explanation.append("• Measuring either qubit immediately collapses the combined state vector!")
    elif has_h:
        explanation.append("\n#### 🌊 Superposition State")
        explanation.append("• The **Hadamard (H)** gate rotates the qubit state vector onto the equator of the Bloch Sphere.")
        explanation.append("• This creates a 50/50 quantum superposition where state $|0\\rangle$ and $|1\\rangle$ exist simultaneously until measurement.")
    elif has_x:
        explanation.append("\n#### 🔄 Quantum Bit-Flip (NOT Gate)")
        explanation.append("• The **Pauli-X** gate acts as a quantum bit-flip, rotating the state vector by $\\pi$ radians around the X-axis of the Bloch Sphere ($|0\\rangle \\rightarrow |1\\rangle$).")
    else:
        explanation.append("\n#### 📊 State Evolution")
        explanation.append("• The state vector evolves deterministically under unitary gate transformations.")

    if simulation_result and "probabilities" in simulation_result:
        explanation.append("\n#### 📈 Probability Distribution")
        for state, prob in simulation_result["probabilities"].items():
            if prob > 0.001:
                explanation.append(f"• **|{state}⟩**: {round(prob * 100, 1)}% chance")
                
    explanation.append("\n> *Tip: Connect your Gemini API Key in the backend `.env` file to unlock dynamic AI Professor insights!*")
    return "\n".join(explanation)


async def chat_with_quantum_ai(
    message: str,
    context: Optional[Dict[str, Any]] = None,
    history: Optional[List[Dict[str, str]]] = None
) -> AIChatResponse:
    client = _get_gemini_client()
    
    system_prompt = "You are QuantumMind AI, an interactive quantum computing mentor. Provide intuitive, clear, mathematically sound, and encouraging explanations."
    
    context_str = ""
    if context:
        context_str = "\nCurrent Lab Context:\n" + json.dumps(context, indent=2)

    full_prompt = f"{system_prompt}\n{context_str}\n\nUser Question: {message}"

    if client:
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=full_prompt
            )
            if response and response.text:
                return AIChatResponse(
                    reply=response.text,
                    suggested_actions=["Explain Bloch Vector", "Simulate Bell State", "Optimize Circuit"]
                )
        except Exception as e:
            print(f"Gemini chat error: {e}")

    # Fallback chat response
    return AIChatResponse(
        reply=f"### Quantum AI Response\n\nYou asked: *'{message}'*\n\nIn quantum computing, state vectors represent information in a $2^N$-dimensional Hilbert space. When you apply unitary operators (gates like $H, X, CNOT$), you rotate the state vector before measurement collapses it into classical bits.",
        suggested_actions=["Build Bell State", "Explore Bloch Sphere", "Run Grover Search"]
    )
