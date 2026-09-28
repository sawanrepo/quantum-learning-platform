from fastapi import APIRouter, HTTPException
from app.schemas.schemas import AssessmentSubmitRequest, AssessmentResultResponse
from app.services.assessment.evaluator import evaluate_challenge_submission

router = APIRouter(prefix="/assessment", tags=["Quantum Circuit Challenges"])

@router.post("/submit", response_model=AssessmentResultResponse)
async def submit_challenge_circuit(req: AssessmentSubmitRequest):
    """
    Automated evaluation of user circuit submissions against challenge goals.
    """
    try:
        result = evaluate_challenge_submission(req)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Assessment Error: {str(e)}")
