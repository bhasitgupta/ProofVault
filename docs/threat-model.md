# Threat Model & Attack Surface Analysis

## Threat Actors
1. **Malicious Insider:** An officer with valid system credentials attempting to alter evidence in a case they are investigating.
2. **Corrupted Database Admin:** A DBA with direct read/write access to Postgres attempting to modify testimony or delete incident rows.
3. **Storage Compromiser:** An attacker with access to S3/MinIO attempting bit-rot attacks or ciphertext tampering.
4. **Adversarial Input (Prompt Injection):** An attacker crafting documents containing prompt injection directives (`IGNORE PREVIOUS INSTRUCTIONS`).

## Countermeasures & Invariants

| Attack Vector | Countermeasure | Verification |
|---------------|----------------|--------------|
| Altering document text in DB | Chunk Merkle root verification against on-chain root | `test_chunk_tamper.py` |
| Tampering with ciphertext in object store | Tier 3 SHA-256 blob verification vs immutable ledger record | `test_blob_tamper.py` |
| Swapping ciphertext across documents | AES-256-GCM authenticated data (AAD) bound to `doc_id` | `test_envelope.py` |
| Querying unassigned cases | Live case assignment query on every request (Rule C8) | `test_cross_case_leak.py` |
| Prompt injection via evidence text | Strict XML evidence isolation & regex sanitizer (Rule C11) | `test_prompt_injection.py` |
| Malware upload | Immediate signature scan and quarantine routing before hashing | `test_malware_upload.py` |
