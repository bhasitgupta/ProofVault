// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AuditAnchorRegistry
 * @notice High-throughput Merkle Tree Batch Anchoring Contract for Nyaya-Vault (Polygon Amoy).
 * Anchors periodic Merkle tree digests of audit events and RAG queries onto Polygon for BSA §63 non-repudiation.
 * Governed by on-chain multi-admin architecture.
 */
contract AuditAnchorRegistry {
    struct AnchorBatch {
        bytes32 merkleRoot;
        uint256 startSequence;
        uint256 endSequence;
        uint256 timestamp;
        address anchorSigner;
    }

    // --- On-Chain Multi-Admin & Role State ---
    mapping(address => bool) public isAdmin;
    uint256 public adminCount;
    mapping(address => bool) public isAnchorer;

    AnchorBatch[] public batches;

    // --- Events ---
    event AdminAdded(address indexed newAdmin, address indexed addedBy);
    event AdminRemoved(address indexed admin, address indexed removedBy);
    event AnchorerUpdated(address indexed anchorer, bool authorized, address indexed updatedBy);
    event AuditBatchAnchored(bytes32 indexed merkleRoot, uint256 indexed startSeq, uint256 indexed endSeq, uint256 timestamp);

    // --- Modifiers ---
    modifier onlyAdmin() {
        require(isAdmin[msg.sender], "AuditAnchorRegistry: caller not admin");
        _;
    }

    modifier onlyAuthorized() {
        require(isAdmin[msg.sender] || isAnchorer[msg.sender], "AuditAnchorRegistry: unauthorized");
        _;
    }

    constructor() {
        isAdmin[msg.sender] = true;
        isAnchorer[msg.sender] = true;
        adminCount = 1;
        emit AdminAdded(msg.sender, msg.sender);
        emit AnchorerUpdated(msg.sender, true, msg.sender);
    }

    // ==========================================
    // ON-CHAIN MULTI-ADMIN GOVERNANCE
    // ==========================================

    function addAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Zero address");
        require(!isAdmin[newAdmin], "Already admin");
        isAdmin[newAdmin] = true;
        adminCount++;
        emit AdminAdded(newAdmin, msg.sender);
    }

    function removeAdmin(address admin) external onlyAdmin {
        require(adminCount > 1, "Cannot remove last admin");
        require(isAdmin[admin], "Not admin");
        isAdmin[admin] = false;
        adminCount--;
        emit AdminRemoved(admin, msg.sender);
    }

    function setAnchorer(address anchorer, bool authorized) external onlyAdmin {
        require(anchorer != address(0), "Zero address");
        isAnchorer[anchorer] = authorized;
        emit AnchorerUpdated(anchorer, authorized, msg.sender);
    }

    // ==========================================
    // BATCH MERKLE ANCHORING & PROOF VERIFICATION
    // ==========================================

    function anchorAuditBatch(
        bytes32 merkleRoot,
        uint256 startSeq,
        uint256 endSeq
    ) external onlyAuthorized returns (uint256 batchId) {
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

    function verifyAuditLeaf(
        bytes32 leafHash,
        bytes32[] calldata proof,
        uint256 batchId
    ) external view returns (bool) {
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

    function getBatch(uint256 batchId) external view returns (AnchorBatch memory) {
        require(batchId < batches.length, "AAR: batchId out of bounds");
        return batches[batchId];
    }

    function totalBatches() external view returns (uint256) {
        return batches.length;
    }
}
