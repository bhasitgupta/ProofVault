#!/usr/bin/env python3
import hashlib
import sys

def main():
    if len(sys.argv) < 2:
        print('Usage: verify_evidence_cli.py <evidence_file>')
        sys.exit(1)

with open(sys.argv[1], 'rb') as f:
        data = f.read()
    sha256 = hashlib.sha256(data).hexdigest()
    print(f'Computed SHA-256: {sha256}')
