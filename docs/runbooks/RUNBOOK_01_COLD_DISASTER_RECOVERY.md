# Runbook 01: Cold Disaster Recovery & Ledger Resynchronization

### Step 1: Provision Clean Operating Environment

Deploy hardened Linux OS with FIPS 140-3 cryptographic modules enabled.

### Step 2: Restore SQLite / PostgreSQL Metadata

Restore encrypted snapshot and verify HMAC integrity tag before launch.

### Step 3: Replay Polygon Blockchain Event Logs

Query EvidenceRegistered and CustodyLogged events from genesis block.

### Step 4: Reconcile Merkle Root Parity

Compute local Merkle tree and assert equality with on-chain root.
