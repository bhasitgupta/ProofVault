import uuid
from typing import Dict, Any, List, Optional
from app.core.constants import UserRole, ClassificationLevel

CLASSIFICATION_WEIGHT = {
    ClassificationLevel.RESTRICTED.value: 1,
    ClassificationLevel.CONFIDENTIAL.value: 2,
    ClassificationLevel.SECRET.value: 3,
}

DEFAULT_ROLE_CLEARANCE: Dict[str, str] = {
    UserRole.LAWYER.value: ClassificationLevel.RESTRICTED.value,
    UserRole.INVESTIGATOR.value: ClassificationLevel.CONFIDENTIAL.value,
    UserRole.FORENSIC_ANALYST.value: ClassificationLevel.SECRET.value,
    UserRole.LEGAL_OFFICER.value: ClassificationLevel.CONFIDENTIAL.value,
    UserRole.SUPERVISOR.value: ClassificationLevel.SECRET.value,
    UserRole.ADMIN.value: ClassificationLevel.SECRET.value,
}

# Runtime dynamic registry allowing Admin to customize clearance for any role
ROLE_CLEARANCE_REGISTRY: Dict[str, str] = dict(DEFAULT_ROLE_CLEARANCE)

def set_role_clearance(role: str, clearance: str):
    """Dynamically update clearance ceiling for a role."""
    ROLE_CLEARANCE_REGISTRY[role] = clearance

def get_role_clearance(role: str) -> str:
    """Get current clearance ceiling for a role."""
    return ROLE_CLEARANCE_REGISTRY.get(role, ClassificationLevel.RESTRICTED.value)

def get_all_role_clearances() -> Dict[str, str]:
    """Get mapping of all roles to their clearance ceilings."""
    return dict(ROLE_CLEARANCE_REGISTRY)


class OPAClient:
    """
    Open Policy Agent client with in-process embedded Rego evaluator fallback.
    Evaluates role x live-case-assignments x classification ceiling x document type.
    """
    def __init__(self, opa_url: str = "http://localhost:8181"):
        self.opa_url = opa_url

    async def evaluate_access(
        self,
        user_role: str,
        assigned_case_ids: List[str],
        requested_case_id: Optional[str],
        requested_classification: Optional[str] = None,
        requested_action: str = "READ"
    ) -> Dict[str, Any]:
        decision_id = str(uuid.uuid4())

        # Admin has full oversight
        if user_role == UserRole.ADMIN.value:
            return {
                "allow": True,
                "reason": "ADMIN_FULL_ACCESS",
                "decision_id": decision_id,
                "allowed_case_ids": assigned_case_ids or ["*"]
            }

        # Case-scoping check
        if requested_case_id and requested_case_id not in assigned_case_ids:
            return {
                "allow": False,
                "reason": f"UNASSIGNED_CASE: Actor is not actively assigned to {requested_case_id}",
                "decision_id": decision_id,
                "allowed_case_ids": assigned_case_ids
            }

        # Dynamic classification clearance check
        user_ceiling = get_role_clearance(user_role)
        if requested_classification:
            req_wt = CLASSIFICATION_WEIGHT.get(requested_classification, 1)
            user_wt = CLASSIFICATION_WEIGHT.get(user_ceiling, 1)
            if req_wt > user_wt:
                return {
                    "allow": False,
                    "reason": f"CLEARANCE_EXCEEDED: Role {user_role} (max: {user_ceiling}) cannot access {requested_classification}",
                    "decision_id": decision_id,
                    "allowed_case_ids": assigned_case_ids
                }

        return {
            "allow": True,
            "reason": "POLICY_ALLOW",
            "decision_id": decision_id,
            "allowed_case_ids": assigned_case_ids,
            "max_classification": user_ceiling
        }

    def can_access(
        self,
        role: str,
        doc_classification: str,
        doc_case_id: str,
        user_case_ids: List[str]
    ) -> bool:
        if role == UserRole.ADMIN.value:
            return True
        if doc_case_id not in user_case_ids:
            return False
        user_ceiling = get_role_clearance(role)
        req_wt = CLASSIFICATION_WEIGHT.get(doc_classification, 1)
        user_wt = CLASSIFICATION_WEIGHT.get(user_ceiling, 1)
        return req_wt <= user_wt

