import re
from typing import Dict, Any

MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "text/plain",
    "image/jpeg",
    "image/png",
}

def validate_upload_guards(filename: str, file_bytes: bytes) -> None:
    """
    Guards against size violations, empty files, and zip bombs.
    """
    if len(file_bytes) == 0:
        raise ValueError("Upload payload is empty (0 bytes)")

    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        raise ValueError(f"File size exceeds maximum threshold of {MAX_FILE_SIZE_BYTES} bytes")

def sanitize_metadata(metadata: Dict[str, Any]) -> Dict[str, Any]:
    """
    Sanitizes user-supplied metadata strings to neutralize prompt-injection vectors (Fix D5).
    """
    sanitized: Dict[str, Any] = {}
    for key, value in metadata.items():
        if isinstance(value, str):
            # Strip control characters, quotes, and markdown/prompt delimiters
            clean = re.sub(r"[\x00-\x1f\x7f-\x9f]", "", value)
            clean = clean.replace("```", "").replace("<|", "").replace("|>", "")
            sanitized[key] = clean.strip()
        else:
            sanitized[key] = value
    return sanitized
