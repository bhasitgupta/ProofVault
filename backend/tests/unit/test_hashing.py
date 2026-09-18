import hashlib
from app.crypto.hashing import content_hash, blob_hash

def test_content_hash():
    data = b"Case Evidence Test Payload 123"
    expected = hashlib.sha256(data).hexdigest()
    assert content_hash(data) == expected

def test_blob_hash():
    ciphertext = b"EncryptedBlobBytes#%#*(&"
    expected = hashlib.sha256(ciphertext).hexdigest()
    assert blob_hash(ciphertext) == expected
