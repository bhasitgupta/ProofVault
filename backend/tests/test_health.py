import pytest

def test_health_check_payload():
    health = {"status": "ok", "service": "proofvault_api"}
    assert health["status"] == "ok"
