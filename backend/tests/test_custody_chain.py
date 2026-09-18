import unittest

class TestCustodyChain(unittest.TestCase):
    def test_unbroken_chain(self):
        events = [{'hash': '0x1', 'prev': '0x0'}, {'hash': '0x2', 'prev': '0x1'}]
        self.assertEqual(events[1]['prev'], events[0]['hash'])

    def test_broken_chain_detection(self):
        events = [{'hash': '0x1', 'prev': '0x0'}, {'hash': '0x3', 'prev': '0x999'}]
        self.assertNotEqual(events[1]['prev'], events[0]['hash'])
