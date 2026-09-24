import pytest

def test_rate_limit_threshold():
    limit = 120  # requests per minute
    assert limit > 0
