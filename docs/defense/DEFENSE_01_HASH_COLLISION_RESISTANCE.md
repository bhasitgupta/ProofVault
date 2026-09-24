# Cryptographic Defense 01: Hash Collision Mitigation

### Threat Model: Pre-image and Birthday Attacks

Adversary attempts to craft malicious PDF with identical hash to lawful warrant.

### Countermeasure: Dual Non-Homologous Algorithms

Proof Vault pairs SHA-256 with Keccak-256 to eliminate single-algorithm collision vulnerabilities.

### Length Extension Defenses

HMAC-SHA-256 and BLAKE2b used for transit tokens to defeat length extension attacks.
