import pytest

def test_postgrest_prefer_header():
    header = {"Prefer": "return=representation"}
    assert header["Prefer"] == "return=representation"
