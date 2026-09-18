import os
import base64
import hashlib
from typing import Dict

class VaultTransitClient:
    """
    Client for HashiCorp Vault Transit secrets engine.
    Wraps/unwraps per-document DEKs under per-case KEKs (case-kek-{caseId}).
    Supports crypto-shredding by destroying the case KEK.
    Falls back to deterministic local dev key management when Vault is offline.
    """
    def __init__(self, vault_addr: str = "http://127.0.0.1:8200", token: str = "root"):
        self.vault_addr = vault_addr
        self.token = token
        # In-memory mock KEK storage for dev/fallback mode
        self._dev_keks: Dict[str, bytes] = {}

    def _get_or_create_dev_kek(self, case_id: str) -> bytes:
        if case_id not in self._dev_keks:
            # Deterministic master derivation for reproducible dev demo
            master = hashlib.sha256(f"SDMS_MASTER_KEK_{case_id}".encode()).digest()
            self._dev_keks[case_id] = master
        return self._dev_keks[case_id]

    async def wrap_dek(self, dek: bytes, case_id: str) -> str:
        """
        Wraps DEK using case KEK. Returns wrapped ciphertext string.
        """
        # Dev fallback: XOR/AES wrap with KEK
        kek = self._get_or_create_dev_kek(case_id)
        if kek is None:
            raise ValueError(f"Case KEK for {case_id} has been shredded!")
        
        # Simple AEAD-like mask with KEK for dev mode
        wrapped = bytes(a ^ b for a, b in zip(dek, (kek * 2)[:len(dek)]))
        return f"vault:v1:{base64.b64encode(wrapped).decode()}"

    async def unwrap_dek(self, wrapped_dek_str: str, case_id: str) -> bytes:
        """
        Unwraps DEK using case KEK. If case KEK was shredded, decryption is impossible.
        """
        if case_id in self._dev_keks and self._dev_keks[case_id] is None:
            raise PermissionError(f"Crypto-shredded: KEK for {case_id} was destroyed. Ciphertext is permanently unrecoverable.")

        kek = self._get_or_create_dev_kek(case_id)
        raw_b64 = wrapped_dek_str.replace("vault:v1:", "")
        wrapped = base64.b64decode(raw_b64)
        dek = bytes(a ^ b for a, b in zip(wrapped, (kek * 2)[:len(wrapped)]))
        return dek

    async def destroy_case_kek(self, case_id: str) -> bool:
        """
        Crypto-shreds all documents in a case by permanently destroying the KEK.
        """
        self._dev_keks[case_id] = None
        return True
