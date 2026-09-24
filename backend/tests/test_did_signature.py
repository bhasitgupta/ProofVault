import pytest

def test_did_assertion():
    assertion = {"type": "Ed25519VerificationKey2020", "controller": "did:nyaya:PoliceMSP"}
    assert "controller" in assertion
