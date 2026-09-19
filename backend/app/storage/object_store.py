import os
from typing import Optional

from app.config import get_settings

STORAGE_ROOT = get_settings().STORAGE_DIR

class ObjectStore:
    """
    Object store wrapper for encrypted blobs.
    Uses Supabase Cloud Storage when SUPABASE_URL & SUPABASE_KEY are provided.
    Falls back gracefully to local/temp storage in offline dev and testing environments.
    Object keys are derived strictly from doc_id, never user-supplied filenames.
    """
    def __init__(self, root_dir: str = None):
        settings = get_settings()
        self.root_dir = root_dir or settings.STORAGE_DIR
        self.evidence_dir = os.path.join(self.root_dir, "evidence")
        self.quarantine_dir = os.path.join(self.root_dir, "quarantine")
        self.certificates_dir = os.path.join(self.root_dir, "certificates")

        try:
            os.makedirs(self.evidence_dir, exist_ok=True)
            os.makedirs(self.quarantine_dir, exist_ok=True)
            os.makedirs(self.certificates_dir, exist_ok=True)
        except OSError as e:
            print(f"[WARN] ObjectStore local directory notice: {e}")

        # Supabase Storage client
        self.supabase_url = settings.SUPABASE_URL
        self.supabase_key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
        self.evidence_bucket = settings.SUPABASE_STORAGE_BUCKET or "evidence"
        self.quarantine_bucket = settings.SUPABASE_QUARANTINE_BUCKET or "quarantine"
        self.certificates_bucket = settings.SUPABASE_CERTIFICATES_BUCKET or "certificates"

        self.client = None
        if self.supabase_url and self.supabase_key and not self.supabase_url.startswith("dummy"):
            try:
                from supabase import create_client
                self.client = create_client(self.supabase_url, self.supabase_key)
            except Exception as e:
                print(f"[WARN] Could not initialize Supabase client: {e}")

    def _get_target_dir(self, bucket: str) -> str:
        if bucket == "quarantine":
            return self.quarantine_dir
        elif bucket == "certificates":
            return self.certificates_dir
        return self.evidence_dir

    def _get_bucket_name(self, bucket: str) -> str:
        if bucket == "quarantine":
            return self.quarantine_bucket
        elif bucket == "certificates":
            return self.certificates_bucket
        return self.evidence_bucket

    def put_blob(self, doc_id: str, ciphertext: bytes, bucket: str = "evidence") -> str:
        target_dir = self._get_target_dir(bucket)
        local_path = os.path.join(target_dir, f"{doc_id}.enc")

        # 1. Always write locally for fast zero-latency local retrieval/cache
        try:
            with open(local_path, "wb") as f:
                f.write(ciphertext)
        except Exception as e:
            print(f"[WARN] Failed to write local cache for blob {doc_id}: {e}")

        # 2. Upload to Supabase Storage if configured
        if self.client:
            bucket_name = self._get_bucket_name(bucket)
            file_name = f"{doc_id}.enc"
            try:
                self.client.storage.from_(bucket_name).upload(
                    path=file_name,
                    file=ciphertext,
                    file_options={"content-type": "application/octet-stream", "upsert": "true"}
                )
                return f"supabase://{bucket_name}/{file_name}"
            except Exception as e:
                print(f"[WARN] Supabase storage upload notice ({bucket_name}/{file_name}): {e}")

        return local_path

    def get_blob(self, doc_id: str, bucket: str = "evidence") -> bytes:
        target_dir = self._get_target_dir(bucket)
        local_path = os.path.join(target_dir, f"{doc_id}.enc")

        # If file exists in local cache, return it
        if os.path.exists(local_path):
            with open(local_path, "rb") as f:
                return f.read()

        # Otherwise fetch from Supabase Storage
        if self.client:
            bucket_name = self._get_bucket_name(bucket)
            file_name = f"{doc_id}.enc"
            try:
                data = self.client.storage.from_(bucket_name).download(file_name)
                if data:
                    try:
                        with open(local_path, "wb") as f:
                            f.write(data)
                    except Exception:
                        pass
                    return data
            except Exception as e:
                print(f"[WARN] Supabase storage download notice ({bucket_name}/{file_name}): {e}")

        raise FileNotFoundError(f"Blob for {doc_id} not found in Supabase or local storage at {local_path}")

    def exists(self, doc_id: str, bucket: str = "evidence") -> bool:
        target_dir = self._get_target_dir(bucket)
        local_path = os.path.join(target_dir, f"{doc_id}.enc")
        if os.path.exists(local_path):
            return True

        if self.client:
            bucket_name = self._get_bucket_name(bucket)
            file_name = f"{doc_id}.enc"
            try:
                items = self.client.storage.from_(bucket_name).list(search=file_name)
                if any(item.get("name") == file_name for item in items):
                    return True
            except Exception:
                pass

        return False

    def delete_blob(self, doc_id: str, bucket: str = "evidence") -> bool:
        deleted = False
        target_dir = self._get_target_dir(bucket)
        local_path = os.path.join(target_dir, f"{doc_id}.enc")
        if os.path.exists(local_path):
            try:
                os.remove(local_path)
                deleted = True
            except Exception:
                pass

        if self.client:
            bucket_name = self._get_bucket_name(bucket)
            file_name = f"{doc_id}.enc"
            try:
                self.client.storage.from_(bucket_name).remove([file_name])
                deleted = True
            except Exception:
                pass

        return deleted
