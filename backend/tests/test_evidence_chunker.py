import pytest

def test_chunk_size_256kb():
    chunk_size = 256 * 1024
    assert chunk_size == 262144
