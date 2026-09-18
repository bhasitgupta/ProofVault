# Cryptographic Defense 02: Side-Channel & Timing Attack Hardening

### Threat Model: Timing Inferences on Passphrase Verification

Attacker measures API response latency variance to deduce secret credential bytes.

### Countermeasure: Constant-Time Comparisons

All token checks execute via hmac.compare_digest with strictly constant-time execution paths.

### Artificial Jitter Injection
