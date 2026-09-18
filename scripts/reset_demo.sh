#!/usr/bin/env bash
set -e

echo "[*] Resetting SDMS demo environment..."
rm -f backend/sdms_metadata.db backend/test_*.db test_*.db
rm -rf backend/storage/documents/* certificates/* backend/storage/quarantine/*

echo "[*] Re-seeding database..."
cd backend && python3 ../scripts/seed.py
python3 ../scripts/generate_corpus.py

echo "[✓] SDMS demo environment reset and seeded successfully."
