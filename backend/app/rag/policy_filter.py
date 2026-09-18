"""
RAG Policy Filter helper.
Constructs ABAC query filter criteria for Qdrant payload search (C7).
"""
from typing import List, Dict, Any

ROLE_CLEARANCES = {
    "LAWYER": "RESTRICTED",
    "INVESTIGATOR": "CONFIDENTIAL",
    "FORENSIC_ANALYST": "SECRET",
    "LEGAL_OFFICER": "CONFIDENTIAL",
    "SUPERVISOR": "SECRET",
    "ADMIN": "SECRET"
}

def resolve_query_filter(role: str, user_case_ids: List[str], requested_case_ids: List[str] = None) -> Dict[str, Any]:
    """
    Computes effective case scope and classification ceiling.
    """
    if requested_case_ids:
        effective_cases = [c for c in requested_case_ids if c in user_case_ids]
    else:
        effective_cases = user_case_ids

    ceiling = ROLE_CLEARANCES.get(role, "RESTRICTED")
    return {
        "case_ids": effective_cases,
        "classification_ceiling": ceiling
    }
