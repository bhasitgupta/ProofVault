"""
Tamper Attack CLI tool for testing and live evaluation demonstrations.
Allows simulating:
1. bitrot / blob tampering in object storage
2. database chunk modification
3. case metadata tampering
"""
import sys
import os
import sqlite3
import argparse

def tamper_blob(doc_id: str, storage_dir: str = "backend/storage/documents"):
    blob_path = os.path.join(storage_dir, f"{doc_id}.enc")
    if not os.path.exists(blob_path):
        print(f"[!] Ciphertext blob not found: {blob_path}")
        return False
    with open(blob_path, "rb") as f:
        data = bytearray(f.read())
    # Flip last byte
    data[-1] ^= 0xFF
    with open(blob_path, "wb") as f:
        f.write(data)
    print(f"[✓] Tampered ciphertext blob: {blob_path}")
    return True

def tamper_chunk(doc_id: str, chunk_index: int, new_text: str, db_path: str = "backend/sdms_metadata.db"):
    if not os.path.exists(db_path):
        print(f"[!] Database not found: {db_path}")
        return False
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute(
        "UPDATE chunks SET chunk_text = ? WHERE doc_id = ? AND chunk_index = ?",
        (new_text, doc_id, chunk_index)
    )
    conn.commit()
    conn.close()
    print(f"[✓] Tampered chunk text in DB for {doc_id}:{chunk_index}")
    return True

def main():
    parser = argparse.ArgumentParser(description="SDMS Tamper Simulation Tool")
    parser.add_argument("--mode", choices=["blob", "chunk"], required=True)
    parser.add_argument("--doc-id", required=True)
    parser.add_argument("--chunk-index", type=int, default=0)
    parser.add_argument("--new-text", default="TAMPERED: Injected adversarial falsification.")
    args = parser.parse_args()

    if args.mode == "blob":
        tamper_blob(args.doc_id)
    elif args.mode == "chunk":
        tamper_chunk(args.doc_id, args.chunk_index, args.new_text)

if __name__ == "__main__":
    main()
