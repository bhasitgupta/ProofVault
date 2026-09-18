"""
Grounding evaluation module.
Verifies that generated answer assertions are grounded in the verified evidence chunks.
"""
from typing import List, Dict, Any

def evaluate_grounding(answer: str, verified_chunks: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Computes token overlap ratio between the generated answer and retrieved evidence.
    """
    if not verified_chunks or not answer:
        return {"grounded": False, "score": 0.0}

    ans_words = set(answer.lower().split())
    # Exclude common stop words
    stops = {"the", "a", "an", "is", "was", "and", "or", "in", "on", "of", "to", "for", "with", "at", "by"}
    filtered_ans = ans_words - stops
    if not filtered_ans:
        return {"grounded": True, "score": 1.0}

    evidence_text = " ".join([c.get("chunk_text", "").lower() for c in verified_chunks])
    evidence_words = set(evidence_text.split())

    overlap = len(filtered_ans & evidence_words)
    score = overlap / len(filtered_ans)

    return {
        "grounded": score >= 0.3,
        "score": round(score, 3)
    }
