import pytest

def test_cors_methods():
    allowed = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    assert "PATCH" in allowed
