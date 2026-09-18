#!/usr/bin/env python3
import hashlib
import sys

def main():
    if len(sys.argv) < 2:
        print('Usage: verify_evidence_cli.py <evidence_file>')
        sys.exit(1)
