from typing import Protocol, List, Optional, Dict, Any, Tuple
from app.ledger.records import DocRecord, AuditEvent

class LedgerAdapter(Protocol):
    """
    Frozen Ledger protocol. Both FabricLedger and DevLedger implement this interface.
    """
    async def register_document(self, record: DocRecord) -> str:
        """Anchors document on dochash channel. Returns ledger transaction ID."""
        ...

    async def get_document(self, doc_id: str) -> Optional[DocRecord]:
        """Retrieves document record from dochash channel."""
        ...

    async def verify_content_hash(self, doc_id: str, content_hash: str) -> Tuple[bool, str]:
        """Verifies content hash against on-chain anchor. Returns (matches, tx_id)."""
        ...

    async def verify_chunk(
        self, doc_id: str, chunk_index: int, chunk_text: str, proof: List[Dict[str, Any]]
    ) -> Tuple[bool, str]:
        """Verifies Merkle inclusion proof against on-chain root. Returns (valid, tx_id)."""
        ...

    async def append_event(self, event: AuditEvent) -> str:
        """Appends audit event to access channel. Returns ledger transaction ID."""
        ...

    async def get_document_history(self, doc_id: str) -> List[Dict[str, Any]]:
        """Returns history of transactions for a document."""
        ...

    async def get_events(
        self, case_id: Optional[str] = None, actor_id: Optional[str] = None, limit: int = 100
    ) -> List[AuditEvent]:
        """Queries audit events from access channel."""
        ...

    async def mark_shredded(self, doc_id: str, order_ref: str) -> str:
        """Marks document status as SHREDDED on chain. Returns transaction ID."""
        ...
