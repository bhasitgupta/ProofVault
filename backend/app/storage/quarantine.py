import os
import json
from datetime import datetime, timezone
from typing import Dict, Any

from app.config import get_settings

class QuarantineManager:
    """
    Manages isolated quarantine store for malware-flagged files.
    Uploads isolated threats and forensic audit metadata directly to
    the Supabase quarantine storage bucket with isolated local fallback.
    """
    def __init__(self, quarantine_dir: str = None):
        settings = get_settings()
        self.quarantine_dir = quarantine_dir or settings.QUARANTINE_DIR
        try:
            os.makedirs(self.quarantine_dir, exist_ok=True)
        except OSError as e:
            print(f"[WARN] Quarantine directory initialization notice: {e}")

        self.supabase_url = settings.SUPABASE_URL
        self.supabase_key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
        self.quarantine_bucket = settings.SUPABASE_QUARANTINE_BUCKET or "quarantine"
        self.client = None
        if self.supabase_url and self.supabase_key and not self.supabase_url.startswith("dummy"):
            try:
                from supabase import create_client
                self.client = create_client(self.supabase_url, self.supabase_key)
            except Exception as e:
                print(f"[WARN] Supabase quarantine client notice: {e}")

    def quarantine_file(self, doc_id: str, raw_bytes: bytes, threat_name: str, uploader_id: str) -> str:
        quarantine_filename = f"QUARANTINED_{doc_id}.bin"
        meta_filename = f"QUARANTINED_{doc_id}.meta.json"

        quarantine_path = os.path.join(self.quarantine_dir, quarantine_filename)
        meta_path = os.path.join(self.quarantine_dir, meta_filename)

        metadata = {
            "doc_id": doc_id,
            "threat_name": threat_name,
            "uploader_id": uploader_id,
            "quarantined_at": datetime.now(timezone.utc).isoformat(),
            "size_bytes": len(raw_bytes),
        }

        # Local write
        try:
            with open(quarantine_path, "wb") as f:
                f.write(raw_bytes)
            with open(meta_path, "w", encoding="utf-8") as f:
                json.dump(metadata, f, indent=2)
        except Exception as e:
            print(f"[WARN] Local quarantine write notice: {e}")

        # Supabase upload
        if self.client:
            try:
                self.client.storage.from_(self.quarantine_bucket).upload(
                    path=quarantine_filename,
                    file=raw_bytes,
                    file_options={"content-type": "application/octet-stream", "upsert": "true"}
                )
                self.client.storage.from_(self.quarantine_bucket).upload(
                    path=meta_filename,
                    file=json.dumps(metadata).encode("utf-8"),
                    file_options={"content-type": "application/json", "upsert": "true"}
                )
                return f"supabase://{self.quarantine_bucket}/{quarantine_filename}"
            except Exception as e:
                print(f"[WARN] Supabase quarantine upload notice: {e}")

        return quarantine_path
