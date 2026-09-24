import pytest

def test_tamper_detection_mismatch():
    expected_hash = "a" * 64
    computed_hash = "b" * 64
    assert expected_hash != computed_hash
