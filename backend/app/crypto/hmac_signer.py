import hmac
import hashlib

class HMACAuthenticator:
    """
    SHA-256 HMAC for verifying transit telemetry packet integrity.
    """
    @staticmethod
    def sign(message: bytes, secret_key: bytes) -> str:
        return hmac.new(secret_key, message, hashlib.sha256).hexdigest()

    @staticmethod
    def verify(message: bytes, secret_key: bytes, signature_hex: str) -> bool:
        expected = HMACAuthenticator.sign(message, secret_key)
        return hmac.compare_digest(expected, signature_hex)
