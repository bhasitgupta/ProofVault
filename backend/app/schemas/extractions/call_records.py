from pydantic import BaseModel

class CDRRecord(BaseModel):
    calling_number: str
    called_number: str
    duration_seconds: int
    cell_tower_id: str
    timestamp: str

class CDRDossier(BaseModel):
    imei: str
    imsi: str
    carrier: str
    records_count: int
    file_hash: str
