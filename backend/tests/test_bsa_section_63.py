import unittest
from backend.app.compliance.bsa_section_63 import BSACertificateEngine

class TestBSAEngine(unittest.TestCase):
    def test_cert_generation(self):
        engine = BSACertificateEngine()
        cert = engine.generate_section_63_certificate(
            doc_id="DOC-991",
            doc_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            case_id="CASE-101",
            custody_chain=[{"action": "SEIZURE"}]
        )
        self.assertIn("statute", cert)
        self.assertEqual(cert["evidentiary_target"]["document_id"], "DOC-991")
        self.assertTrue(cert["digital_seal_sha256"])

if __name__ == '__main__':
    unittest.main()
