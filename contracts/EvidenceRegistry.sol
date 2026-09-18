// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title EvidenceRegistry
 * @notice Core Electronic Evidence & Merkle Root Registry for Nyaya-Vault (Polygon Amoy / EVM).
 * Strictly adheres to SIH26190 Technical Requirements Document (TRD §12.1 & §13) and SRS §6.6.
 * Anchors document Merkle roots, plaintext content hashes, batch rollups, and statutory hold statuses.
 * Enforces on-chain decentralized multi-admin governance and minting authorization.
 */
contract EvidenceRegistry {
    enum Status { REGISTERED, ACTIVE, SUPERSEDED, LEGAL_HOLD, SHREDDED }

    struct EvidenceRecord {
        bytes32 docIdHash;
        bytes32 contentHash;
        bytes32 merkleRoot;
        bytes32 blobHash;
        string caseId;
        uint256 batchId;
        uint256 registeredAt;
        Status status;
        address registrar;
        bool exists;
    }

    // --- On-Chain Multi-Admin & Registrar State ---
    mapping(address => bool) public isAdmin;
    uint256 public adminCount;
    mapping(address => bool) public isRegistrar;

    // --- Evidence Storage ---
    mapping(bytes32 => EvidenceRecord) private _evidence;
    bytes32[] private _allDocHashes;

    // --- Events (All Data Preserved On-Chain) ---
    event AdminAdded(address indexed newAdmin, address indexed addedBy);
    event AdminRemoved(address indexed admin, address indexed removedBy);
    event RegistrarUpdated(address indexed registrar, bool authorized, address indexed updatedBy);

    event EvidenceRegistered(
        bytes32 indexed docIdHash,
        bytes32 indexed merkleRoot,
        bytes32 contentHash,
        string caseId,
        uint256 batchId,
        uint256 timestamp,
        address indexed registrar
    );

    event EvidenceMinted(
        bytes32 indexed docIdHash,
        bytes32 indexed merkleRoot,
        string caseId,
        uint256 timestamp,
        address indexed registrar
    );

    event EvidenceStatusUpdated(
        bytes32 indexed docIdHash,
        Status previousStatus,
        Status newStatus,
        address indexed updatedBy,
        uint256 timestamp
    );

    // --- Modifiers ---
    modifier onlyAdmin() {
        require(isAdmin[msg.sender], "EvidenceRegistry: caller not admin");
        _;
    }

    modifier onlyAuthorized() {
        require(isAdmin[msg.sender] || isRegistrar[msg.sender], "EvidenceRegistry: unauthorized");
        _;
    }

    constructor() {
        isAdmin[msg.sender] = true;
        isRegistrar[msg.sender] = true;
        adminCount = 1;
        emit AdminAdded(msg.sender, msg.sender);
        emit RegistrarUpdated(msg.sender, true, msg.sender);
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

    function setRegistrar(address registrar, bool authorized) external onlyAdmin {
        require(registrar != address(0), "Zero address");
        isRegistrar[registrar] = authorized;
        emit RegistrarUpdated(registrar, authorized, msg.sender);
    }

    // ==========================================
    // EVIDENCE REGISTRATION & MINTING (TRD §12.1)
    // ==========================================

    function registerEvidence(
        bytes32 docIdHash,
        bytes32 contentHash,
        bytes32 merkleRoot,
        bytes32 blobHash,
        string calldata caseId,
        uint256 batchId
    ) public onlyAuthorized {
        require(!_evidence[docIdHash].exists, "EvidenceRegistry: document already registered");
        require(merkleRoot != bytes32(0), "EvidenceRegistry: invalid merkle root");
        require(contentHash != bytes32(0), "EvidenceRegistry: invalid content hash");

        _evidence[docIdHash] = EvidenceRecord({
            docIdHash: docIdHash,
            contentHash: contentHash,
            merkleRoot: merkleRoot,
            blobHash: blobHash,
            caseId: caseId,
            batchId: batchId,
            registeredAt: block.timestamp,
            status: Status.REGISTERED,
            registrar: msg.sender,
            exists: true
        });

        _allDocHashes.push(docIdHash);

        emit EvidenceRegistered(
            docIdHash,
            merkleRoot,
            contentHash,
            caseId,
            batchId,
            block.timestamp,
            msg.sender
        );

        emit EvidenceMinted(
            docIdHash,
            merkleRoot,
            caseId,
            block.timestamp,
            msg.sender
        );
    }

    function mintEvidence(
        bytes32 docIdHash,
        bytes32 contentHash,
        bytes32 merkleRoot,
        bytes32 blobHash,
        string calldata caseId,
        uint256 batchId
    ) external onlyAuthorized {
        registerEvidence(docIdHash, contentHash, merkleRoot, blobHash, caseId, batchId);
    }

    // ==========================================
    // STATUTORY LIFECYCLE & LEGAL HOLD
    // ==========================================

    function updateStatus(bytes32 docIdHash, Status newStatus) public onlyAuthorized {
        require(_evidence[docIdHash].exists, "EvidenceRegistry: document not found");
        Status prev = _evidence[docIdHash].status;
        require(prev != Status.SHREDDED, "EvidenceRegistry: cannot modify shredded document");
        _evidence[docIdHash].status = newStatus;
        emit EvidenceStatusUpdated(docIdHash, prev, newStatus, msg.sender, block.timestamp);
    }

    function imposeLegalHold(bytes32 docIdHash) external onlyAuthorized {
        updateStatus(docIdHash, Status.LEGAL_HOLD);
    }

    function liftLegalHold(bytes32 docIdHash) external onlyAuthorized {
        updateStatus(docIdHash, Status.ACTIVE);
    }

    function isUnderLegalHold(bytes32 docIdHash) external view returns (bool) {
        if (!_evidence[docIdHash].exists) return false;
        return _evidence[docIdHash].status == Status.LEGAL_HOLD;
    }

    // ==========================================
    // VERIFICATION & AUDIT (TRD §12.1 & §13)
    // ==========================================

    function getEvidence(bytes32 docIdHash) external view returns (EvidenceRecord memory) {
        require(_evidence[docIdHash].exists, "EvidenceRegistry: evidence not found");
        return _evidence[docIdHash];
    }

    function verifyContentHash(bytes32 docIdHash, bytes32 candidateHash) external view returns (bool) {
        if (!_evidence[docIdHash].exists) return false;
        return _evidence[docIdHash].contentHash == candidateHash;
    }

    function verifyMerkleRoot(bytes32 docIdHash, bytes32 candidateRoot) external view returns (bool) {
        if (!_evidence[docIdHash].exists) return false;
        return _evidence[docIdHash].merkleRoot == candidateRoot;
    }

    function verifyChunkProof(
        bytes32 leaf,
        bytes32[] calldata proof,
        bytes32 root
    ) public pure returns (bool) {
        bytes32 computedHash = leaf;
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

    function getTotalEvidenceCount() external view returns (uint256) {
        return _allDocHashes.length;
    }
}
