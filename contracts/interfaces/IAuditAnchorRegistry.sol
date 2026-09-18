// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IAuditAnchorRegistry
 * @notice Batch Merkle root anchor interface for audit log provenance
 */
interface IAuditAnchorRegistry {
    struct AnchorBatch {
        bytes32 merkleRoot;
        uint256 startSequence;
        uint256 endSequence;
        uint256 timestamp;
        address anchorSigner;
    }

    event AuditBatchAnchored(bytes32 indexed merkleRoot, uint256 indexed startSeq, uint256 indexed endSeq, uint256 timestamp);

    function anchorAuditBatch(bytes32 merkleRoot, uint256 startSeq, uint256 endSeq) external returns (uint256 batchId);
    function verifyAuditLeaf(bytes32 leafHash, bytes32[] calldata proof, uint256 batchId) external view returns (bool);
}
