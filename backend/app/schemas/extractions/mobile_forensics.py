from pydantic import BaseModel

class MobileExtractionReport(BaseModel):
    make: str
    model: str
    os_version: str
    tool_name: str = 'Cellebrite UFED'
    extraction_type: str = 'PHYSICAL'

class ChatMessageArtifact(BaseModel):
    platform: str = 'WhatsApp'
    sender_id: str
    recipient_id: str
    message_body: str
    message_timestamp: str

class LocationGeoPoint(BaseModel):
    lat: float
    lng: float
    accuracy_meters: float
    captured_at: str
