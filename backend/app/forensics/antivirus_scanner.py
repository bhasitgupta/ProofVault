class StorageQuarantineInspector:
    """Inspects backend storage and handles quarantined evidence safely."""
    @staticmethod
    def is_safe_to_process(file_path: str) -> bool:
        return not file_path.endswith('.quarantine')
