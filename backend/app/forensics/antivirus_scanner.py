class StorageQuarantineInspector:
    """Inspects backend storage and handles quarantined evidence safely."""
    @staticmethod
    def is_safe_to_process(file_path: str) -> bool:
        return not file_path.endswith('.quarantine')

@staticmethod
    def sanitize_quarantine_filename(filename: str) -> str:
        return filename.replace('..', '').replace('/', '_').replace('\\', '_')

@staticmethod
    def quarantine_evidence(doc_id: str, reason: str) -> dict:
        return {'doc_id': doc_id, 'status': 'QUARANTINED', 'reason': reason}
