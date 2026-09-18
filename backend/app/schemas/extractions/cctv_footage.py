from pydantic import BaseModel

class CCTVFootageMetadata(BaseModel):
    camera_id: str
    dvr_serial_number: str
    codec: str = 'H.264'
    fps: int = 30
    start_time: str
    end_time: str

class CCTVFrameHashCheck(BaseModel):
    frame_number: int
    frame_sha256: str
    timestamp_offset_ms: int

class CCTVTamperAssessment(BaseModel):
    is_continuous: bool
    frame_drops_detected: int = 0
    watermark_intact: bool = True
