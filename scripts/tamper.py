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
    # First try SQLAlchemy with application DATABASE_URL
    try:
        import sys
        backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
        if backend_dir not in sys.path:
            sys.path.insert(0, backend_dir)
        from app.config import get_settings
        from sqlalchemy import text
        from sqlalchemy.ext.asyncio import create_async_engine
        import asyncio

        db_url = get_settings().DATABASE_URL
        connect_args = {"statement_cache_size": 0} if ("postgresql" in db_url or "postgres" in db_url) else {}
        engine = create_async_engine(db_url, connect_args=connect_args, echo=False)

        async def _async_tamper():
            async with engine.begin() as conn:
                await conn.execute(
                    text("UPDATE chunks SET chunk_text = :txt WHERE doc_id = :did AND chunk_index = :idx"),
                    {"txt": new_text, "did": doc_id, "idx": chunk_index}
                )
            await engine.dispose()

        asyncio.run(_async_tamper())
        print(f"[✓] Tampered chunk text in DB ({db_url}) for {doc_id}:{chunk_index}")
        return True
    except Exception as e:
        # Fallback to direct sqlite3 file modification if present
        if os.path.exists(db_path):
            import sqlite3
            conn = sqlite3.connect(db_path)
            cur = conn.cursor()
            cur.execute(
                "UPDATE chunks SET chunk_text = ? WHERE doc_id = ? AND chunk_index = ?",
                (new_text, doc_id, chunk_index)
            )
            conn.commit()
            conn.close()
            print(f"[✓] Tampered chunk text in local SQLite for {doc_id}:{chunk_index}")
            return True
        print(f"[!] Tampering failed: {e}")
        return False

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
