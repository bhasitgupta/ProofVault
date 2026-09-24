import pytest

def test_audit_event_keys():
    expected = {"event_id", "actor_id", "action", "outcome", "created_at"}
    data = {"event_id": "evt_1", "actor_id": "USR-1", "action": "LOGIN", "outcome": "ALLOW", "created_at": "2026-01-01"}
    assert expected.issubset(data.keys())
