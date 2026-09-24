import pytest

def test_iso27037_stages():
    stages = ["identification", "collection", "acquisition", "preservation"]
    assert "preservation" in stages
