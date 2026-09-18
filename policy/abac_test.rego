package sdms.abac_test

import data.sdms.abac

test_admin_allowed {
    abac.allow with input as {
        "user": {"role": "ADMIN", "assigned_case_ids": []},
        "document": {"case_id": "CASE-101", "classification": "SECRET"}
    }
}

test_investigator_confidential_allowed {
    abac.allow with input as {
        "user": {"role": "INVESTIGATOR", "assigned_case_ids": ["CASE-101"]},
        "document": {"case_id": "CASE-101", "classification": "CONFIDENTIAL"}
    }
}

test_investigator_secret_denied {
    not abac.allow with input as {
        "user": {"role": "INVESTIGATOR", "assigned_case_ids": ["CASE-101"]},
        "document": {"case_id": "CASE-101", "classification": "SECRET"}
    }
}

test_unassigned_case_denied {
    not abac.allow with input as {
        "user": {"role": "FORENSIC_ANALYST", "assigned_case_ids": ["CASE-101"]},
        "document": {"case_id": "CASE-999", "classification": "SECRET"}
    }
}
