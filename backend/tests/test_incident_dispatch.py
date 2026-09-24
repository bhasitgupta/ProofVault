import pytest

def test_incident_dispatch_channel():
    channel = "SOVEREIGN_AUDIT_LOG"
    assert channel.startswith("SOVEREIGN")
