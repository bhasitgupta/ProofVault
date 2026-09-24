import pytest

def test_document_classification_levels():
    levels = ["RESTRICTED", "CONFIDENTIAL", "SECRET"]
    assert len(levels) == 3
