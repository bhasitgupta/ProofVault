import os
from datetime import datetime, timezone
from typing import Dict, Any

from app.config import get_settings

class QuarantineManager:
    """
    Manages isolated quarantine store for malware-flagged files.
    Write-only from app perspective; logs forensic metadata.
    """
    def __init__(self, quarantine_dir: str = None):
        self.quarantine_dir = quarantine_dir or get_settings().QUARANTINE_DIR
        try:
            os.makedirs(self.quarantine_dir, exist_ok=True)
        except OSError as e:
            print(f"[WARN] Quarantine directory initialization notice: {e}")

    def quarantine_file(self, doc_id: str, raw_bytes: bytes, threat_name: str, uploader_id: str) -> str:
        quarantine_path = os.path.join(self.quarantine_dir, f"QUARANTINED_{doc_id}.bin")
        with open(quarantine_path, "wb") as f:
            f.write(raw_bytes)

        meta_path = os.path.join(self.quarantine_dir, f"QUARANTINED_{doc_id}.meta.json")
        metadata = {
            "doc_id": doc_id,
            "threat_name": threat_name,
            "uploader_id": uploader_id,
            "quarantined_at": datetime.now(timezone.utc).isoformat(),
            "size_bytes": len(raw_bytes),
        }
        with open(meta_path, "w") as f:
            import json
            json.dump(metadata, f, indent=2)

        return quarantine_path
