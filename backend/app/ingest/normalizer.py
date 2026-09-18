import re
import unicodedata

def normalize_text(raw_text: str) -> str:
    """
    De-hyphenation across line breaks, repeated header/footer removal,
    whitespace, and Unicode normalization (NFKC).
    Runs BEFORE chunk hashing so hashes are deterministic across environments.
    """
    if not raw_text:
        return ""

    # 1. Unicode NFKC normalization
    text = unicodedata.normalize("NFKC", raw_text)

    # 2. De-hyphenate words broken across lines (e.g. "inves- \ntigation" -> "investigation")
    text = re.sub(r"(\w+)-\s*\n\s*(\w+)", r"\1\2", text)

    # 3. Collapse consecutive whitespace and linebreaks
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    cleaned = "\n".join(lines)
    cleaned = re.sub(r"[ \t]+", " ", cleaned)

    return cleaned.strip()
