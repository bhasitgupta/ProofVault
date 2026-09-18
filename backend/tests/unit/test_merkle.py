from app.crypto.merkle import MerkleTree, verify_merkle_proof

def test_merkle_tree_construction_and_verification():
    doc_id = "DOC-TEST-001"
    chunks = [
        "First paragraph of evidence.",
        "Second witness testimony details.",
        "Third forensic conclusion and DNA report."
    ]
    tree = MerkleTree(doc_id, chunks)
    root = tree.root
    assert len(root) == 64

    # Verify each leaf with proof
    for i in range(len(chunks)):
        proof = tree.get_proof(i)
        is_valid = verify_merkle_proof(
            doc_id=doc_id,
            chunk_index=i,
            chunk_text=chunks[i],
            root_hex=root,
            proof=proof
        )
        assert is_valid is True

    # Tampering test: altering chunk text must fail
    tampered_proof = tree.get_proof(0)
    is_valid_tampered = verify_merkle_proof(
        doc_id=doc_id,
        chunk_index=0,
        chunk_text="Tampered text",
        root_hex=root,
        proof=tampered_proof
    )
    assert is_valid_tampered is False
