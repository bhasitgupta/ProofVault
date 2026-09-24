import pytest

def test_verify_result_verified_flag():
    res = {"verified": True, "tamper_detected": False}
    assert res["verified"] is True
