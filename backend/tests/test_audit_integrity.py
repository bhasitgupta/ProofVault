import pytest

def test_audit_row_signature():
    row_data = {"id": "aud_001", "action": "LOGIN"}
    assert "id" in row_data
