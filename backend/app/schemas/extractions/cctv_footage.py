from pydantic import BaseModel

class CCTVFootageMetadata(BaseModel):
    camera_id: str
    dvr_serial_number: str
    codec: str = 'H.264'
    fps: int = 30
    start_time: str
    end_time: str
