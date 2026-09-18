import unittest
from backend.app.crypto.merkle_tree import MerkleTree

class TestMerkleTree(unittest.TestCase):
    def test_single_leaf(self):
        tree = MerkleTree([b"evidence_01"])
        self.assertEqual(len(tree.root), 32)

    def test_multi_leaves(self):
        leaves = [b"doc_1", b"doc_2", b"doc_3", b"doc_4"]
        tree = MerkleTree(leaves)
        self.assertIsNotNone(tree.root_hex)
        proof = tree.get_proof(0)
        self.assertTrue(len(proof) > 0)

if __name__ == '__main__':
    unittest.main()
