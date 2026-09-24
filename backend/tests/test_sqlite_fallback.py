import pytest

def test_sqlite_url_scheme():
    url = "sqlite:///./proofvault.db"
    assert url.startswith("sqlite")
