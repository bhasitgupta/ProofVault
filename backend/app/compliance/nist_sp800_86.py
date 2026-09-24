class NISTSP80086ForensicFramework:
    """
    NIST SP 800-86 Guide to Integrating Forensic Techniques into Incident Response.
    Applies the Collection, Examination, Analysis, and Reporting (CEAR) methodology.
    """
    @staticmethod
    def evaluate_pipeline_phase(phase: str) -> bool:
        valid_phases = {"COLLECTION", "EXAMINATION", "ANALYSIS", "REPORTING"}
        return phase.upper() in valid_phases

"""NIST SP 800-86: Forensic data handling and integrity verification checks."""
