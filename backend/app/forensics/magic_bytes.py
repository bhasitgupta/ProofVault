class MagicByteInspector:
    """
    Validates true MIME signatures against stated file extensions to defeat extension spoofing.
    """
    SIGNATURES = {
        b"%PDF": "application/pdf",
        b"\xFF\xD8\xFF": "image/jpeg",
        b"\x89PNG\r\n\x1a\n": "image/png",
        b"PK\x03\x04": "application/zip",
        b"\x50\x4B\x03\x04": "application/vnd.openxmlformats-officedocument",
    }

    @classmethod
    def detect_mime(cls, header_bytes: bytes) -> str:
        for magic, mime in cls.SIGNATURES.items():
            if header_bytes.startswith(magic):
                return mime
        return "application/octet-stream"
