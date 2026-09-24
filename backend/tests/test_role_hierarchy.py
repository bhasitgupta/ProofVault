import pytest

def test_role_hierarchy():
    roles = ["LAWYER", "INVESTIGATOR", "FORENSIC_ANALYST", "SUPERVISOR", "ADMIN"]
    assert roles.index("ADMIN") > roles.index("INVESTIGATOR")
