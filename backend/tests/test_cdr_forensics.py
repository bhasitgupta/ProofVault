import unittest
from backend.app.schemas.extractions.call_records import CDRRecord

class TestCDRForensics(unittest.TestCase):
    def test_valid_cdr(self):
        record = CDRRecord(calling_number='+919876543210', called_number='+919876543211', duration_seconds=120, cell_tower_id='TOW-001', timestamp='2026-09-18T12:00:00Z')
        self.assertEqual(record.duration_seconds, 120)
