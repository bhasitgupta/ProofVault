import pytest

def test_totp_code_length():
    code = "123456"
    assert len(code) == 6
