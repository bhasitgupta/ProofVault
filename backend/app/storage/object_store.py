import os
from typing import Optional

STORAGE_ROOT = os.getenv("STORAGE_DIR", os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "storage_data")))

class ObjectStore:
    """
    Object store wrapper for encrypted blobs.
    Uses S3/MinIO in production and local filesystem in dev/demo mode.
    Object keys are derived from doc_id, never user-supplied filenames.
    """
    def __init__(self, root_dir: str = STORAGE_ROOT):
        self.root_dir = root_dir
        self.evidence_dir = os.path.join(self.root_dir, "evidence")
        self.quarantine_dir = os.path.join(self.root_dir, "quarantine")
        os.makedirs(self.evidence_dir, exist_ok=True)
        os.makedirs(self.quarantine_dir, exist_ok=True)

    def put_blob(self, doc_id: str, ciphertext: bytes, bucket: str = "evidence") -> str:
        target_dir = self.quarantine_dir if bucket == "quarantine" else self.evidence_dir
        path = os.path.join(target_dir, f"{doc_id}.enc")
        with open(path, "wb") as f:
            f.write(ciphertext)
        return path

    def get_blob(self, doc_id: str, bucket: str = "evidence") -> bytes:
        target_dir = self.quarantine_dir if bucket == "quarantine" else self.evidence_dir
        path = os.path.join(target_dir, f"{doc_id}.enc")
        if not os.path.exists(path):
            raise FileNotFoundError(f"Blob for {doc_id} not found at {path}")
        with open(path, "rb") as f:
            return f.read()

    def exists(self, doc_id: str, bucket: str = "evidence") -> bool:
        target_dir = self.quarantine_dir if bucket == "quarantine" else self.evidence_dir
        path = os.path.join(target_dir, f"{doc_id}.enc")
        return os.path.exists(path)

    def delete_blob(self, doc_id: str, bucket: str = "evidence") -> bool:
        target_dir = self.quarantine_dir if bucket == "quarantine" else self.evidence_dir
        path = os.path.join(target_dir, f"{doc_id}.enc")
        if os.path.exists(path):
            os.remove(path)
            return True
        return False
