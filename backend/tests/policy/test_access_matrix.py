from app.policy.opa_client import OPAClient

def test_policy_access_matrix():
    opa = OPAClient()

    # 1. Investigator on Case 101 with Confidential doc -> ALLOW
    assert opa.can_access(
        role="INVESTIGATOR",
        doc_classification="CONFIDENTIAL",
        doc_case_id="CASE-101",
        user_case_ids=["CASE-101", "CASE-102"]
    ) is True

    # 2. Investigator on Case 101 with Secret doc -> DENY (exceeds clearance)
    assert opa.can_access(
        role="INVESTIGATOR",
        doc_classification="SECRET",
        doc_case_id="CASE-101",
        user_case_ids=["CASE-101"]
    ) is False

    # 3. Lawyer on Case 101 with Confidential doc -> DENY (Lawyer ceiling is Restricted)
    assert opa.can_access(
        role="LAWYER",
        doc_classification="CONFIDENTIAL",
        doc_case_id="CASE-101",
        user_case_ids=["CASE-101"]
    ) is False

    # 4. Forensic Analyst on unassigned Case 999 -> DENY (C8: not assigned)
    assert opa.can_access(
        role="FORENSIC_ANALYST",
        doc_classification="SECRET",
        doc_case_id="CASE-999",
        user_case_ids=["CASE-101"]
    ) is False
