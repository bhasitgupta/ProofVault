import unittest
import os
from backend.app.forensics.entropy_scanner import EntropyScanner

class TestEntropyScanner(unittest.TestCase):
    def test_low_entropy(self):
        plain = b"A" * 1000
        entropy = EntropyScanner.calculate_shannon_entropy(plain)
        self.assertAlmostEqual(entropy, 0.0, places=2)

    def test_high_entropy(self):
        random_bytes = os.urandom(2048)
        entropy = EntropyScanner.calculate_shannon_entropy(random_bytes)
        self.assertTrue(entropy > 7.5)

if __name__ == '__main__':
    unittest.main()
