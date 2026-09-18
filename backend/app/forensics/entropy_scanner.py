import math
from collections import Counter

class EntropyScanner:
    """
    Shannon Entropy Scanner:
    Calculates file entropy to detect packed, obfuscated, or encrypted malware before ingest.
    """
    @staticmethod
    def calculate_shannon_entropy(data: bytes) -> float:
        if not data:
            return 0.0
        length = len(data)
        counts = Counter(data)
        entropy = 0.0
        for count in counts.values():
            p = count / length
            entropy -= p * math.log2(p)
        return round(entropy, 4)

    @classmethod
    def is_suspicious_entropy(cls, data: bytes, threshold: float = 7.8) -> bool:
        """Entropy > 7.8 typically indicates encryption, high packing, or compiled obfuscation."""
        return cls.calculate_shannon_entropy(data) >= threshold
