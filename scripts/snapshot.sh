#!/usr/bin/env bash
set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
SNAPSHOT_DIR="snapshots/snapshot_${TIMESTAMP}"
mkdir -p "${SNAPSHOT_DIR}"

echo "[*] Creating SDMS system snapshot at ${SNAPSHOT_DIR}..."
cp backend/sdms_metadata.db "${SNAPSHOT_DIR}/" 2>/dev/null || true
cp dev_ledger.db "${SNAPSHOT_DIR}/" 2>/dev/null || true
tar -czf "${SNAPSHOT_DIR}/evidence_blobs.tar.gz" backend/storage/documents 2>/dev/null || true

echo "[✓] Snapshot preserved in ${SNAPSHOT_DIR}."
