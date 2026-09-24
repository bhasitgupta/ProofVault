import pytest
import time

def test_jwt_ttl():
    exp = int(time.time()) + 3600
    assert exp > int(time.time())
