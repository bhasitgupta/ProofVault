# Runbook 01: Cold Disaster Recovery & Ledger Resynchronization

### Step 1: Provision Clean Operating Environment

Deploy hardened Linux OS with FIPS 140-3 cryptographic modules enabled.

### Step 2: Restore SQLite / PostgreSQL Metadata

Restore encrypted snapshot and verify HMAC integrity tag before launch.
