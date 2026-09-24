import pytest

def test_pydantic_case_id_regex():
    import re
    case_id = "CASE001"
    assert re.match(r"^[A-Z0-9_-]+$", case_id) is not None
