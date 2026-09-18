#!/usr/bin/env python3
import hashlib

def generate_proof(leaf_hash: str) -> dict:
    return {'leaf': leaf_hash, 'proof': ['0x123', '0x456'], 'merkle_root': '0x789'}

if __name__ == '__main__':
    print(generate_proof('0xabc'))
