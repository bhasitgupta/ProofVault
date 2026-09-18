#!/usr/bin/env bash
set -e

echo "=================================================="
echo "      SDMS Environment Bootstrap & Initializer    "
echo "=================================================="

# Check Python and Node
python3 --version
node --version

echo "[1/3] Setting up Python dependencies & seeding metadata..."
cd backend
python3 -c "import app.main; print('[✓] Backend imports verified')"
cd ..
python3 scripts/seed.py
python3 scripts/generate_corpus.py

echo "[2/3] Verifying frontend build..."
cd frontend
npm run build
cd ..

echo "[3/3] Running redteam verification..."
python3 scripts/redteam.py

echo "=================================================="
echo "[✓] SDMS Bootstrap Successful! System Ready."
echo "=================================================="

