"""
Prompt Injection Guard (C11).
Detects and neutralizes prompt injection patterns in retrieved text before feeding to LLM.
"""
import re

DANGEROUS_PATTERNS = [
    r"(?i)ignore\s+(all\s+|previous\s+|prior\s+)?instructions?",
    r"(?i)system\s*:",
    r"(?i)<\|im_start\|>",
    r"(?i)<\|im_end\|>",
    r"(?i)<\|endoftext\|>",
    r"(?i)###\s*(instruction|system|human)",
    r"(?i)you\s+are\s+now\s+(unrestricted|in\s+developer\s+mode|dan)",
    r"(?i)disregard\s+the\s+above"
]

def sanitize_chunk_text(text: str) -> str:
    """
    Strips or neutralizes jailbreak triggers from chunk text.
    """
    sanitized = text
    for pat in DANGEROUS_PATTERNS:
        sanitized = re.sub(pat, "[FILTERED_INSTRUCTION]", sanitized)
    return sanitized

def check_injection(text: str) -> bool:
    """
    Returns True if an injection attempt was detected.
    """
    for pat in DANGEROUS_PATTERNS:
        if re.search(pat, text):
            return True
    return False
