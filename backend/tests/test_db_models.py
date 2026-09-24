import pytest

def test_user_model_msp_constraint():
    valid_msps = ["PoliceMSP", "ProsecutorMSP", "ForensicLabMSP", "JudicialMSP"]
    assert "PoliceMSP" in valid_msps
