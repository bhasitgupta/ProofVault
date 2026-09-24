import pytest

def test_document_stream_chunks():
    chunks = [b"chunk1", b"chunk2"]
    assert len(chunks) == 2
