from app.rag.citation import extract_citations, validate_citations

def test_extract_and_validate_citations():
    text = "The suspect was present [DOC-1:0] and fingerprints were found [DOC-1:1] as well as outside [DOC-2:0]."
    citations = extract_citations(text)
    assert len(citations) == 3

    allowed_doc_ids = {"DOC-1"}
    verified_chunks = [
        {"doc_id": "DOC-1", "chunk_index": 0, "page_number": 1, "chunk_hash": "hash0", "ledger_tx_id": "tx0"},
        {"doc_id": "DOC-1", "chunk_index": 1, "page_number": 2, "chunk_hash": "hash1", "ledger_tx_id": "tx1"},
        {"doc_id": "DOC-2", "chunk_index": 0, "page_number": 1, "chunk_hash": "hash2", "ledger_tx_id": "tx2"},
    ]

    valid = validate_citations(citations, allowed_doc_ids, verified_chunks)
    assert len(valid) == 2
    for v in valid:
        assert v["doc_id"] == "DOC-1"
        assert v["status"] == "VERIFIED"
