import unittest
import time

class TestLegalHold(unittest.TestCase):
    def test_active_legal_hold(self):
        hold = {'case_id': 'CASE-101', 'expiry': time.time() + 3600}
        self.assertTrue(hold['expiry'] > time.time())

def test_expired_legal_hold(self):
        hold = {'case_id': 'CASE-102', 'expiry': time.time() - 100}
        self.assertFalse(hold['expiry'] > time.time())
