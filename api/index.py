import sys
import os
from pathlib import Path

# Add backend directory to Python path
ROOT_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = ROOT_DIR / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# Ensure serverless writable storage in /tmp
os.environ.setdefault("STORAGE_DIR", "/tmp/storage_data")
os.environ.setdefault("QUARANTINE_DIR", "/tmp/storage_data/quarantine")

from app.main import app
