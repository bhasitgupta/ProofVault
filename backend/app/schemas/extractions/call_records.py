from pydantic import BaseModel

class CDRRecord(BaseModel):
    calling_number: str
    called_number: str
    duration_seconds: int
    cell_tower_id: str
    timestamp: str
