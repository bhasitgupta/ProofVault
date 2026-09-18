from app.ingest.chunker import chunk_pages

def test_chunk_pages_deterministic():
    pages = [
        {"page_number": 1, "text": "This is page one of the statement. " * 30},
        {"page_number": 2, "text": "This is page two with conclusive facts. " * 30}
    ]
    doc_id = "DOC-99"
    chunks1 = chunk_pages(pages, doc_id)
    chunks2 = chunk_pages(pages, doc_id)

    assert len(chunks1) > 0
    assert len(chunks1) == len(chunks2)
    # Ensure chunk hashes and indexes are completely deterministic
    for c1, c2 in zip(chunks1, chunks2):
        assert c1["chunk_hash"] == c2["chunk_hash"]
        assert c1["chunk_index"] == c2["chunk_index"]
        assert c1["page_number"] in [1, 2]
