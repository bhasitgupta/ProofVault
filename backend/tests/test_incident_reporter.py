import pytest

def test_incident_severity_levels():
    levels = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    assert "CRITICAL" in levels
