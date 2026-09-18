import unittest
from backend.app.schemas.extractions.mobile_forensics import MobileExtractionReport

class TestMobileForensics(unittest.TestCase):
    def test_extraction_report(self):
        report = MobileExtractionReport(make='Apple', model='iPhone 15 Pro', os_version='iOS 18.0')
        self.assertEqual(report.extraction_type, 'PHYSICAL')
