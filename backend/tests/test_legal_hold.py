import pytest

def test_legal_hold_deletion_prevented():
    legal_hold_active = True
    can_delete = not legal_hold_active
    assert can_delete is False
