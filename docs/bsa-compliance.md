# Bharatiya Sakshya Adhiniyam (BSA) §63 / IEA §65B Compliance & Admissibility Framework

## 1. Legal Mandate & Statutory Background

Under the Indian criminal justice framework, electronic records must satisfy strict statutory admissibility conditions to be accepted as substantive evidence in a court of law:
- **Historical Statute**: Section 65B of the Indian Evidence Act, 1872 (IEA)
- **Modern Statute**: Section 63 of the Bharatiya Sakshya Adhiniyam, 2023 (BSA)

Section 63 of the BSA stipulates that any electronic record produced by a computer system shall be deemed to be a document and admissible in any proceedings without further proof or production of the original, provided that:
1. The electronic record was produced by the computer system during a period over which the computer was used regularly to store or process information.
2. Information of that kind was regularly supplied to the computer in the ordinary course of legitimate activities.
3. The computer was operating properly throughout that period, or periods of non-operation did not affect the accuracy of the electronic record.
4. The information reproduced in the electronic record duplicates or is derived from information supplied in the ordinary course of activities.
5. The record is accompanied by an authoritative certificate signed by a person occupying a responsible official position in relation to the management or operation of the relevant computer or storage device.

---

## 2. SDMS Compliance Architecture

SDMS is engineered from the ground up to automate and enforce full compliance with BSA §63:

```
+-------------------------------------------------------------------------------------------------+
|                                 BSA §63 Statutory Requirements                                  |
+------------------------------------------------+------------------------------------------------+
| Statutory Condition                            | SDMS Architectural Enforcement                 |
+------------------------------------------------+------------------------------------------------+
| 1. Unaltered Reproduction                      | 4-Tier Cryptographic Integrity Verification    |
| 2. Custodial Continuity & Chain of Custody     | Dual-Channel Permissioned Ledger (Hyperledger) |
| 3. Responsible Custodian Certificate           | Automated PDF Certificate with Officer Signature|
| 4. System Integrity & Non-Tampering Affirmation| Ledger Monotonic Timestamp & Hardware-Backed PKI|
| 5. Public / Judicial Verifiability             | Offline QR Verification + Public Merkle Verify |
+------------------------------------------------+------------------------------------------------+
```

---

## 3. 4-Tier Integrity Hierarchy

To satisfy the statutory requirement of proving the electronic record has not suffered data rot, bit flips, or malicious modification:

1. **Tier 1 (Chunk Level)**:
   $$\text{Verify } H_{\text{leaf}}(i) \stackrel{?}{=} \text{SHA-256}(\mathtt{0x00} \parallel \text{doc\_id} \parallel \text{uint32be}(i) \parallel \text{chunk\_text})$$
2. **Tier 2 (Merkle Proof Level)**:
   Reconstructs the root path from chunk $i$ up to $R_{\text{computed}}$ and checks against the ledger's committed $R_{\text{merkle}}$.
3. **Tier 3 (Ciphertext Blob Level)**:
   $$\text{Verify } \text{SHA-256}(\text{Encrypted Blob on Disk}) \stackrel{?}{=} B_{\text{blob}}^{\text{ledger}}$$
4. **Tier 4 (Canonical Content Level)**:
   $$\text{Verify } \text{SHA-256}(\text{NFKC-Normalized Full Text}) \stackrel{?}{=} C_{\text{content}}^{\text{ledger}}$$

If any tier fails, the document is quarantined with an immediate on-chain `TAMPER_ALERT` and is rejected from court admission.

---

## 4. BSA §63 Certificate Structure & Generation

Upon authorized judicial request or export by the investigating officer, SDMS dynamically compiles a tamper-evident Certificate of Authenticity (PDF/A compliant).

### Certificate Contents
- **Certificate Metadata**: Unique Certificate UUID (`cert_id`), Issuing Authority, Timestamp Authority (TSA) RFC 3161 token.
- **Evidence Identification**: Canonical Document UUID (`doc_id`), FIR / Case Context (`case_id`), Original Filename, Document Classification, MIME type, Byte size.
- **Cryptographic Fingerprints**:
  - SHA-256 Canonical Content Hash
  - SHA-256 AES-256-GCM Blob Hash
  - Domain-Separated Merkle Root
  - Total Verified Chunks Count
- **Chain of Custody Ledger Evidence**:
  - Hyperledger Fabric / DevLedger Transaction ID (`ledger_tx_id`)
  - Ledger Registration Timestamp (UTC)
  - Monotonic Block Height / Sequence
- **Statutory Affirmation Clause**:
  > *"I, [Officer Name], occupying the official position of [Designation], hereby certify under Section 63 of the Bharatiya Sakshya Adhiniyam, 2023, that the digital record described above was ingested, processed, and preserved within the Secure Digital Management System (SDMS) in the ordinary course of official duties. The system remained operating properly without tampering or unauthorized modification."*
- **Embedded Offline QR Code**:
  High-density 2D QR code encoding the cryptographic verification URL with query parameters:
  `https://sdms.mha.gov.in/verify?doc_id=<UUID>&cert_id=<UUID>&root=<MERKLE_ROOT>`

---

## 5. Judicial Standard Operating Procedure (SOP)

When presenting electronic evidence generated by SDMS before a Magistrate or Sessions Court:
1. **Filing**: The Investigating Officer (IO) submits the printed BSA §63 Certificate along with the police report / charge sheet under BNSS §193 (CrPC §173).
2. **Judicial Inspection**: The court scans the QR code or inputs the `doc_id` into the judicial verification terminal.
3. **Live On-Chain Verification**: The court workstation queries the `dochash-channel` directly, validating the certificate's SHA-256 hash against the immutable ledger transaction.
4. **Admissibility Ruling**: Under BSA §63(2), the evidence is admitted without requiring the forensic physical seizure of the SDMS server infrastructure.

