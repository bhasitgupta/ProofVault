# Judicial Evidence Rule 02: RFC 3161 Timestamp Authority

### Monotonic Time Sources

Timestamps must synchronize with National Physical Laboratory (NPL) India NTP servers.

### Drift Tolerance Window

Maximum allowable clock drift between nodes is ±500 milliseconds.

### Cryptographic Time Tokens

Time tokens anchored via X.509 TSA certificate with RSA-4096 or ECDSA P-384.

### Admissibility in Cross-Examination

Court may call Designated Scientist to testify regarding NTP clock integrity.
