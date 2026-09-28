import math
from typing import Dict, Tuple
from app.schemas.schemas import AssessmentSubmitRequest, AssessmentResultResponse
from app.services.quantum.simulator import run_quantum_simulation
from app.services.learning.curriculum_data import get_module_by_id

def evaluate_challenge_submission(req: AssessmentSubmitRequest) -> AssessmentResultResponse:
    # Find matching module or challenge
    target_probs: Dict[str, float] = {}
    found_challenge = None
    
    for m in get_all_modules_list():
        if m.challenge and m.challenge.id == req.challenge_id:
            found_challenge = m.challenge
            target_probs = m.challenge.target_probabilities
            break
            
    if not found_challenge:
        # Default fallback target
        target_probs = {"0": 0.5, "1": 0.5}

    # Run simulation on user's submitted circuit
    sim_result = run_quantum_simulation(req.circuit)
    actual_probs = sim_result.probabilities

    # Calculate probability overlap / quantum state fidelity score
    fidelity = 0.0
    for state, target_p in target_probs.items():
        actual_p = actual_probs.get(state, 0.0)
        # Classical fidelity measure sum sqrt(p_i * q_i)
        fidelity += math.sqrt(max(0.0, target_p) * max(0.0, actual_p))

    score = int(round(fidelity * 100))
    passed = score >= 85

    if passed:
        feedback = f"🎉 Outstanding Quantum Engineering! Your circuit achieved {score}% fidelity with the target state distribution."
    else:
        feedback = f"⚠️ Target state mismatch ({score}% fidelity). Review the hint and gate sequence to align your output probabilities."

    return AssessmentResultResponse(
        passed=passed,
        score=score,
        feedback=feedback,
        expected_probabilities=target_probs,
        actual_probabilities=actual_probs,
        fidelity=round(fidelity, 4)
    )

def get_all_modules_list():
    from app.services.learning.curriculum_data import get_all_modules
    return get_all_modules()
