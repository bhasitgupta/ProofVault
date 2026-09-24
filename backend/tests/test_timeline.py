import pytest

def test_timeline_ordering():
    events = [{"ts": 100}, {"ts": 200}]
    assert events[0]["ts"] < events[1]["ts"]
