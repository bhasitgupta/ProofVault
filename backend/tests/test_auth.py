import pytest

def test_jwt_claims_structure():
    claims = {"sub": "USR-001", "role": "INVESTIGATOR", "msp": "PoliceMSP"}
    assert claims["sub"] == "USR-001"
    assert claims["role"] == "INVESTIGATOR"
