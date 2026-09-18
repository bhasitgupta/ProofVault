# Cryptographic Specification: Domain-Separated Merkle Trees

## 1. Scope & Security Guarantees

In SDMS, textual evidence is decomposed into deterministic chunks for semantic indexing and retrieval. To prove that any chunk presented to a court or judicial officer was extracted from an unaltered document committed to the blockchain, SDMS uses a **Domain-Separated Binary Merkle Tree**.

### Security Objectives
1. **Collision Resistance**: Under the SHA-256 standard assumption, finding two distinct sets of evidence chunks yielding identical Merkle roots requires $\approx 2^{128}$ operations.
2. **Second-Preimage Resistance with Domain Separation (RFC 6962)**: Prevents leaf-vs-internal node ambiguity attacks where an interior node is presented as a valid leaf chunk.
3. **Cross-Document Binding**: Each leaf includes the document's canonical `doc_id` to prevent chunk transposition across different evidence files.
4. **Logarithmic Audit Proofs**: A verifier can mathematically confirm the presence and integrity of a specific chunk in an $N$-chunk document in $O(\log N)$ hashing operations without accessing the rest of the document.

---

## 2. Hashing Primitives & Domain Separation

SDMS adheres to RFC 6962 domain separation prefixes to distinguish leaf and internal node inputs:

| Primitive | Domain Prefix | Purpose |
| :--- | :--- | :--- |
| `LEAF_PREFIX` | `0x00` (1 byte) | Applied to all terminal leaf nodes representing evidence chunks. |
| `NODE_PREFIX` | `0x01` (1 byte) | Applied to all interior and root nodes combining child hashes. |

---

## 3. Leaf Node Computation

Given a document with canonical identifier `doc_id` (UTF-8 encoded string) and chunk index $i \ge 0$ (represented as a 32-bit big-endian unsigned integer `uint32be`), the leaf hash $H_{\text{leaf}}(i)$ is computed as:

$$H_{\text{leaf}}(i) = \text{SHA-256}\Big(\mathtt{0x00} \parallel \text{doc\_id}_{\text{utf8}} \parallel \text{uint32be}(i) \parallel \text{chunk\_text}_{\text{utf8}}\Big)$$

### Binary Layout of Leaf Input
```
+---------------+------------------------+-------------------+----------------------------+
| 0x00 (1 byte) | doc_id bytes (36 B)    | uint32be (4 B)    | chunk_text bytes (varlen)  |
+---------------+------------------------+-------------------+----------------------------+
```

---

## 4. Internal Node & Root Computation

For any pair of adjacent child nodes $\langle L, R \rangle$ where $L$ and $R$ are 32-byte SHA-256 digests in raw binary form:

$$H_{\text{node}}(L, R) = \text{SHA-256}\Big(\mathtt{0x01} \parallel L \parallel R\Big)$$

### Binary Layout of Internal Node Input
```
+---------------+----------------------+----------------------+
| 0x01 (1 byte) | Left Child (32 B)    | Right Child (32 B)   |
+---------------+----------------------+----------------------+
```

### Tree Construction Algorithm
1. Construct the base layer $L_0 = [H_{\text{leaf}}(0), H_{\text{leaf}}(1), \dots, H_{\text{leaf}}(N-1)]$.
2. For each level $L_k$:
   - Pair adjacent elements $(L_k[2j], L_k[2j+1])$ and compute $H_{\text{node}}(L_k[2j], L_k[2j+1])$.
   - **Odd Node Promotion Rule**: If $|L_k|$ is odd, the final unmatched node $L_k[|L_k|-1]$ is promoted directly to level $L_{k+1}$ without duplication or dummy padding.
3. Terminate when $|L_m| = 1$. The single element in $L_m$ is the **Merkle Root** $R_{\text{merkle}}$.

---

## 5. Audit Proof Generation & Verification

### 5.1 Proof Structure
An inclusion proof for chunk $i$ consists of an ordered sequence of sibling tuples:
```json
[
  { "hash": "<hex_string_32_bytes>", "side": "left" | "right" },
  ...
]
```

### 5.2 Verification Algorithm
To verify that chunk `chunk_text` at index $i$ belongs to root $R_{\text{expected}}$:
```python
def verify_merkle_proof(doc_id: str, chunk_index: int, chunk_text: str, root_hex: str, proof: list) -> bool:
    current_hash = hash_leaf(doc_id, chunk_index, chunk_text)
    for step in proof:
        sibling = step["hash"]
        if step["side"] == "left":
            current_hash = hash_nodes(sibling, current_hash)
        else:
            current_hash = hash_nodes(current_hash, sibling)
    return current_hash.lower() == root_hex.lower()
```

If `current_hash` matches `root_hex`, the chunk is mathematically proven to be identical to the text originally registered on the permissioned ledger.

