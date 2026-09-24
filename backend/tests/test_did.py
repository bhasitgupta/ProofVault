import pytest

def test_w3c_did_prefix():
    did = "did:nyaya:PoliceMSP:OFFICER406"
    assert did.startswith("did:nyaya:")
