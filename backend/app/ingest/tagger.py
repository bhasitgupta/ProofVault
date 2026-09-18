from typing import Dict, Any
from app.core.constants import DocumentType, ClassificationLevel

def validate_and_tag(
    case_id: str,
    doc_type: str,
    classification: str,
    filename: str,
) -> Dict[str, Any]:
    """
    Validates user-supplied document metadata and enriches it with system tags.
    Returns the structured payload written to Qdrant alongside chunk vectors.
    """
    # Validate enumerations
    valid_doc_types = {d.value for d in DocumentType}
    valid_classifications = {c.value for c in ClassificationLevel}

    if doc_type not in valid_doc_types:
        raise ValueError(f"Invalid doc_type '{doc_type}'. Must be one of: {valid_doc_types}")

    if classification not in valid_classifications:
        raise ValueError(f"Invalid classification '{classification}'. Must be one of: {valid_classifications}")

    return {
        "case_id": case_id,
        "doc_type": doc_type,
        "classification": classification,
        "filename": filename,
    }
