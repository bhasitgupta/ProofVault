import pytest

def test_case_status_validity():
    statuses = ["ACTIVE", "LEGAL_HOLD", "DISPOSED", "ARCHIVED"]
    assert "ACTIVE" in statuses
    assert "LEGAL_HOLD" in statuses
