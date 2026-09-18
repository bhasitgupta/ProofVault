// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IAuditAnchorRegistry.sol";

/**
 * @title AuditAnchorRegistry
 * @notice Anchors periodic Merkle tree digests of evidentiary audit events to Polygon Amoy
 */
contract AuditAnchorRegistry is IAuditAnchorRegistry {
    address public immutable anchorAuthority;
    AnchorBatch[] public batches;

    modifier onlyAuthority() {
        require(msg.sender == anchorAuthority, "AAR: unauthorized anchor authority");
        _;
    }

    constructor() {
        anchorAuthority = msg.sender;
    }

    function anchorAuditBatch(bytes32 merkleRoot, uint256 startSeq, uint256 endSeq) external override onlyAuthority returns (uint256 batchId) {
        require(merkleRoot != bytes32(0), "AAR: empty merkle root");
        require(endSeq >= startSeq, "AAR: invalid sequence window");

        batchId = batches.length;
        batches.push(AnchorBatch({
            merkleRoot: merkleRoot,
            startSequence: startSeq,
            endSequence: endSeq,
            timestamp: block.timestamp,
            anchorSigner: msg.sender
        }));

        emit AuditBatchAnchored(merkleRoot, startSeq, endSeq, block.timestamp);
    }

    function verifyAuditLeaf(bytes32 leafHash, bytes32[] calldata proof, uint256 batchId) external view override returns (bool) {
        require(batchId < batches.length, "AAR: batchId out of bounds");
        bytes32 root = batches[batchId].merkleRoot;
        bytes32 computedHash = leafHash;

        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];
            if (computedHash <= proofElement) {
                computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
            } else {
                computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
            }
        }

        return computedHash == root;
    }

    function totalBatches() external view returns (uint256) {
        return batches.length;
    }
}
