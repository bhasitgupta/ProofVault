import pytest
import os
import sys

# Ensure backend root and workspace root are on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from app.ledger.dev_ledger import DevLedger

@pytest.fixture
def dev_ledger():
    return DevLedger(db_path="test_ledger.db")

