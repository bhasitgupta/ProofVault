import hashlib
import json
import sqlite3
from typing import List, Optional, Dict, Any, Tuple
from app.ledger.records import DocRecord, AuditEvent
from app.crypto.merkle import verify_merkle_proof

class DevLedger:
    """
    Append-only hash-chained SQLite ledger for offline demo resilience.
    Implements the exact same LedgerAdapter protocol as FabricLedger.
    """
    def __init__(self, db_path: str = "sdms_dev_ledger.db"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS dochash_channel (
                    tx_id TEXT PRIMARY KEY,
                    doc_id TEXT UNIQUE,
                    record_json TEXT NOT NULL,
                    block_num INTEGER NOT NULL,
                    created_at TEXT NOT NULL
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS access_channel (
                    tx_id TEXT PRIMARY KEY,
                    event_id TEXT UNIQUE,
                    action TEXT NOT NULL,
                    actor_id TEXT NOT NULL,
                    case_id TEXT,
                    event_json TEXT NOT NULL,
                    prev_hash TEXT NOT NULL,
                    current_hash TEXT NOT NULL,
                    block_num INTEGER NOT NULL,
                    created_at TEXT NOT NULL
                )
            """)
            conn.commit()

    async def register_document(self, record: DocRecord) -> str:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT doc_id FROM dochash_channel WHERE doc_id = ?", (record.docId,))
            if cursor.fetchone():
                raise ValueError(f"Document {record.docId} already registered (Write-Once enforcement)")

            cursor.execute("SELECT COUNT(*) FROM dochash_channel")
            block_num = cursor.fetchone()[0] + 1

            payload = record.to_canonical_json()
            tx_id = f"tx_doc_{hashlib.sha256(payload.encode()).hexdigest()[:16]}"

            cursor.execute(
                "INSERT INTO dochash_channel (tx_id, doc_id, record_json, block_num, created_at) VALUES (?, ?, ?, ?, ?)",
                (tx_id, record.docId, payload, block_num, record.ingestTimestampUtc),
            )
            conn.commit()
            return tx_id

    async def get_document(self, doc_id: str) -> Optional[DocRecord]:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT record_json FROM dochash_channel WHERE doc_id = ?", (doc_id,))
            row = cursor.fetchone()
            if not row:
                return None
            return DocRecord.model_validate_json(row[0])

    async def verify_content_hash(self, doc_id: str, content_hash: str) -> Tuple[bool, str]:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT tx_id, record_json FROM dochash_channel WHERE doc_id = ?", (doc_id,))
            row = cursor.fetchone()
            if not row:
                return (False, "")
            tx_id, record_json = row
            rec = DocRecord.model_validate_json(record_json)
            matches = (rec.contentHash.lower() == content_hash.lower())
            return (matches, tx_id)

    async def verify_chunk(
        self, doc_id: str, chunk_index: int, chunk_text: str, proof: List[Dict[str, Any]]
    ) -> Tuple[bool, str]:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT tx_id, record_json FROM dochash_channel WHERE doc_id = ?", (doc_id,))
            row = cursor.fetchone()
            if not row:
                return (False, "")
            tx_id, record_json = row
            rec = DocRecord.model_validate_json(record_json)
            valid = verify_merkle_proof(doc_id, chunk_index, chunk_text, rec.chunkMerkleRoot, proof)
            return (valid, tx_id)

    async def append_event(self, event: AuditEvent) -> str:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT current_hash, block_num FROM access_channel ORDER BY block_num DESC LIMIT 1")
            last_row = cursor.fetchone()
            if last_row:
                prev_hash = last_row[0]
                block_num = last_row[1] + 1
            else:
                prev_hash = "GENESIS_ROOT_HASH_00000000000000000000000000000000000000000000000000"
                block_num = 1

            event.prevEventHash = prev_hash
            canonical = event.to_canonical_json()
            curr_hash = hashlib.sha256((prev_hash + canonical).encode("utf-8")).hexdigest()
            tx_id = f"tx_evt_{curr_hash[:16]}"

            cursor.execute(
                """
                INSERT INTO access_channel 
                (tx_id, event_id, action, actor_id, case_id, event_json, prev_hash, current_hash, block_num, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (tx_id, event.eventId, event.action, event.actorId, event.caseId, canonical, prev_hash, curr_hash, block_num, event.tsUtc),
            )
            conn.commit()
            return tx_id

    async def get_document_history(self, doc_id: str) -> List[Dict[str, Any]]:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT tx_id, block_num, created_at, record_json FROM dochash_channel WHERE doc_id = ?", (doc_id,))
            row = cursor.fetchone()
            if not row:
                return []
            return [{
                "tx_id": row[0],
                "block_num": row[1],
                "created_at": row[2],
                "record": json.loads(row[3])
            }]

    async def get_events(
        self, case_id: Optional[str] = None, actor_id: Optional[str] = None, limit: int = 100
    ) -> List[AuditEvent]:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            query = "SELECT event_json FROM access_channel WHERE 1=1"
            params = []
            if case_id:
                query += " AND case_id = ?"
                params.append(case_id)
            if actor_id:
                query += " AND actor_id = ?"
                params.append(actor_id)
            query += " ORDER BY block_num DESC LIMIT ?"
            params.append(limit)

            cursor.execute(query, tuple(params))
            rows = cursor.fetchall()
            return [AuditEvent.model_validate_json(r[0]) for r in rows]

    async def mark_shredded(self, doc_id: str, order_ref: str) -> str:
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT record_json, block_num FROM dochash_channel WHERE doc_id = ?", (doc_id,))
            row = cursor.fetchone()
            if not row:
                raise ValueError(f"Document {doc_id} not found")
            rec = DocRecord.model_validate_json(row[0])
            rec.status = "SHREDDED"
            updated = rec.to_canonical_json()
            tx_id = f"tx_shred_{hashlib.sha256(updated.encode()).hexdigest()[:16]}"
            cursor.execute(
                "UPDATE dochash_channel SET record_json = ? WHERE doc_id = ?",
                (updated, doc_id)
            )
            conn.commit()
            return tx_id
