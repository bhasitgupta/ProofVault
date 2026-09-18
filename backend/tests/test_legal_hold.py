import unittest
import time

class TestLegalHold(unittest.TestCase):
    def test_active_legal_hold(self):
        hold = {'case_id': 'CASE-101', 'expiry': time.time() + 3600}
        self.assertTrue(hold['expiry'] > time.time())
