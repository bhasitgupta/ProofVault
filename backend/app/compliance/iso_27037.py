from enum import Enum
from typing import List, Dict, Any

class ISOPhase(str, Enum):
    IDENTIFICATION = "IDENTIFICATION"
    COLLECTION = "COLLECTION"
    ACQUISITION = "ACQUISITION"
    PRESERVATION = "PRESERVATION"

class ISO27037Validator:
    """
    ISO/IEC 27037: Guidelines for identification, collection, acquisition and preservation of digital evidence.
    """
    REQUIRED_METADATA = ["source_device", "collector_id", "acquisition_method", "verification_hash", "timestamp"]

    @classmethod
    def validate_acquisition(cls, metadata: Dict[str, Any]) -> (bool, List[str]):
        missing = [field for field in cls.REQUIRED_METADATA if field not in metadata or not metadata[field]]
        return len(missing) == 0, missing

"""ISO 27037: Digital evidence acquisition and preservation standard verification."""
