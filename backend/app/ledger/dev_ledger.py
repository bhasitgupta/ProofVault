"""
DevLedger compatibility module.
Delegates to PolygonProvenanceAdapter without creating any SQLite ledger databases or Fabric channels.
"""
from app.ledger.polygon_adapter import PolygonProvenanceAdapter

class DevLedger(PolygonProvenanceAdapter):
    """Compatibility wrapper that operates purely in-memory/EVM simulation."""
    def __init__(self, db_path: str = None):
        super().__init__()
