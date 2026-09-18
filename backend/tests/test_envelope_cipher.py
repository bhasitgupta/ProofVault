import unittest
from backend.app.crypto.envelope_cipher import EnvelopeCipher

class TestEnvelopeCipher(unittest.TestCase):
    def test_encrypt_decrypt_roundtrip(self):
        dek = EnvelopeCipher.generate_dek()
        aad = b"DOC-12345"
        plaintext = b"Classified Forensic Evidentiary Transcript"
        nonce, ciphertext = EnvelopeCipher.encrypt_payload(plaintext, dek, aad)
        decrypted = EnvelopeCipher.decrypt_payload(ciphertext, nonce, dek, aad)
        self.assertEqual(decrypted, plaintext)

if __name__ == '__main__':
    unittest.main()
