import pytest

def test_case_index_tokens():
    docket = "CASE001 RAPE INVESTIGATION"
    tokens = docket.lower().split()
    assert "case001" in tokens
