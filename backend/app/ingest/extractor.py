import fitz  # PyMuPDF
from typing import List, Dict, Any

def extract_text_pages(file_bytes: bytes, mime_type: str = "application/pdf") -> List[Dict[str, Any]]:
    """
    Extracts text preserving page numbers.
    For born-digital PDFs, PyMuPDF is 10x faster than OCR.
    Falls back to raw text decoding for plain text files.
    """
    pages: List[Dict[str, Any]] = []

    if mime_type == "text/plain":
        text = file_bytes.decode("utf-8", errors="replace")
        pages.append({"page_number": 1, "text": text})
        return pages

    # Default to PDF parsing
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        for i, page in enumerate(doc):
            text = page.get_text("text")
            pages.append({
                "page_number": i + 1,
                "text": text.strip()
            })
        doc.close()
    except Exception as e:
        # Fallback for plain text or unstructured formats
        pages.append({"page_number": 1, "text": file_bytes.decode("utf-8", errors="ignore")})

    return pages
