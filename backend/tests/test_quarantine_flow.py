import pytest

def test_quarantine_trigger():
    mismatch = True
    quarantine_status = "QUARANTINED" if mismatch else "VERIFIED"
    assert quarantine_status == "QUARANTINED"
