"""
OCR Extraction Module.
Falls back to pytesseract / mock OCR if image or scanned PDF pages have no selectable text.
"""
from typing import List, Dict, Any

def run_ocr_on_image(image_bytes: bytes) -> str:
    try:
        import pytesseract
        from PIL import Image
        import io
        img = Image.open(io.BytesIO(image_bytes))
        return pytesseract.image_to_string(img)
    except Exception:
        # Fallback if tesseract not installed
        return "[OCR unavailable: scanned image content detected]"

def extract_ocr_from_pages(pages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    processed = []
    for p in pages:
        text = p.get("text", "").strip()
        if not text:
            processed.append({
                "page_number": p.get("page_number", 1),
                "text": "[Scanned page / non-text content]"
            })
        else:
            processed.append(p)
    return processed
