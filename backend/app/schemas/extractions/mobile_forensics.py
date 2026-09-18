from pydantic import BaseModel

class MobileExtractionReport(BaseModel):
    make: str
    model: str
    os_version: str
    tool_name: str = 'Cellebrite UFED'
    extraction_type: str = 'PHYSICAL'
