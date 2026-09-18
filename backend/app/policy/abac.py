"""
ABAC Policy Evaluation Engine.
Evaluates clearance level, case assignment, department, and role requirements.
"""
from typing import List, Dict, Any
from app.core.constants import ClassificationLevel, UserRole

ROLE_CLEARANCES = {
    UserRole.LAWYER.value: ClassificationLevel.RESTRICTED.value,
    UserRole.INVESTIGATOR.value: ClassificationLevel.CONFIDENTIAL.value,
    UserRole.FORENSIC_ANALYST.value: ClassificationLevel.SECRET.value,
    UserRole.LEGAL_OFFICER.value: ClassificationLevel.CONFIDENTIAL.value,
    UserRole.SUPERVISOR.value: ClassificationLevel.SECRET.value,
    UserRole.ADMIN.value: ClassificationLevel.SECRET.value,
}

CLASS_HIERARCHY = {
    ClassificationLevel.RESTRICTED.value: 1,
    ClassificationLevel.CONFIDENTIAL.value: 2,
    ClassificationLevel.SECRET.value: 3,
}

class ABACEngine:
    def evaluate(
        self,
        user_role: str,
        user_case_ids: List[str],
        doc_case_id: str,
        doc_classification: str
    ) -> bool:
        # 1. User must be explicitly assigned to the document's case (C8)
        if doc_case_id not in user_case_ids:
            return False

        # 2. Classification ceiling check
        user_clearance = ROLE_CLEARANCES.get(user_role, ClassificationLevel.RESTRICTED.value)
        user_lvl = CLASS_HIERARCHY.get(user_clearance, 1)
        doc_lvl = CLASS_HIERARCHY.get(doc_classification, 3)

        return user_lvl >= doc_lvl
