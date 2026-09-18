import unittest
from backend.app.schemas.extractions.cctv_footage import CCTVFootageMetadata

class TestCCTVForensics(unittest.TestCase):
    def test_cctv_metadata(self):
        meta = CCTVFootageMetadata(camera_id='CAM-1', dvr_serial_number='DVR-99', start_time='2026-09-18T10:00:00Z', end_time='2026-09-18T11:00:00Z')
        self.assertEqual(meta.fps, 30)
