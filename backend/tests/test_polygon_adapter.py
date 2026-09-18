import unittest
from backend.app.ledger.polygon_adapter import PolygonLedgerAdapter

class TestPolygonAdapter(unittest.TestCase):
    def setUp(self):
        self.adapter = PolygonLedgerAdapter()

    def test_adapter_initialization(self):
        self.assertIsNotNone(self.adapter)
        self.assertEqual(self.adapter.chain_id, 80002)

def test_contract_address_resolution(self):
        addr = self.adapter.evidence_contract_address
        self.assertTrue(addr.startswith('0x'))
