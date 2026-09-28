from fastapi import APIRouter, HTTPException
from app.schemas.schemas import (
    AICircuitExplainRequest,
    AIChatRequest,
    AIChatResponse
)
from app.services.ai.gemini_service import (
    explain_quantum_circuit,
    chat_with_quantum_ai
)

router = APIRouter(prefix="/ai", tags=["AI Quantum Tutor"])

@router.post("/explain")
async def explain_circuit_endpoint(req: AICircuitExplainRequest):
    """
    Generate professor-grade explanation, debugging, or optimization advice for a circuit using Google Gemini API.
    """
    try:
        explanation = await explain_quantum_circuit(
            circuit=req.circuit,
            simulation_result=req.simulation_result,
            action_type=req.action_type,
            custom_question=req.custom_question
        )
        return {"explanation": explanation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Tutor Service Error: {str(e)}")


@router.post("/chat", response_model=AIChatResponse)
async def chat_endpoint(req: AIChatRequest):
    """
    Context-aware interactive dialogue with Gemini AI Quantum Professor.
    """
    try:
        response = await chat_with_quantum_ai(
            message=req.message,
            context=req.context,
            history=req.conversation_history
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Chat Error: {str(e)}")
