import pytest

def test_polygon_amoy_default_rpc():
    rpc = "https://rpc-amoy.polygon.technology"
    assert rpc.startswith("https://")
