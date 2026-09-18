import unittest
from backend.app.forensics.magic_bytes import MagicByteInspector

class TestMagicBytes(unittest.TestCase):
    def test_pdf_detection(self):
        header = b"%PDF-1.7 standard legal document"
        mime = MagicByteInspector.detect_mime(header)
        self.assertEqual(mime, "application/pdf")

    def test_png_detection(self):
        header = b"\x89PNG\r\n\x1a\n\x00\x00\x00"
        mime = MagicByteInspector.detect_mime(header)
        self.assertEqual(mime, "image/png")

if __name__ == '__main__':
    unittest.main()
