// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ProvenanceRegistry
 * @notice Cryptographic Chain-of-Custody & Forensic Audit Trail for Nyaya-Vault (Polygon Amoy).
 * Records sequential, cryptographically linked transfer and access events across institutional agencies.
 * Governed by on-chain multi-admin architecture.
 * Includes permissionless logCase() for court-admissible case anchoring by any wallet.
 */
contract ProvenanceRegistry {
    struct CustodyEvent {
        bytes32 eventId;
        bytes32 docIdHash;
        string caseId;
        string action;
        string actorId;
        string actorRole;
        string outcome;
        string reason;
        uint256 timestamp;
        bytes32 prevEventHash;
    }

    struct CaseAnchor {
        bytes32 caseIdHash;
        string caseId;
        address anchoredBy;
        uint256 anchoredAt;
        bool exists;
    }

    // --- On-Chain Multi-Admin & Role State ---
    mapping(address => bool) public isAdmin;
    uint256 public adminCount;
    mapping(address => bool) public isWriter;

    // --- Case Anchor Storage (permissionless) ---
    mapping(bytes32 => CaseAnchor) private _caseAnchors;
    bytes32[] private _allCaseHashes;

    // --- Event Storage ---
    mapping(bytes32 => CustodyEvent) private _events;
    mapping(bytes32 => bytes32[]) private _docEventChain;
    mapping(string => bytes32[]) private _caseEventChain;

    // --- Events ---
    event AdminAdded(address indexed newAdmin, address indexed addedBy);
    event AdminRemoved(address indexed admin, address indexed removedBy);
    event WriterUpdated(address indexed writer, bool authorized, address indexed updatedBy);

    /// @notice Emitted when any wallet anchors a case ID on-chain (permissionless)
    event CaseAnchored(
        bytes32 indexed caseIdHash,
        string caseId,
        address indexed anchoredBy,
        uint256 timestamp
    );

    event CustodyLogged(
        bytes32 indexed eventId,
        bytes32 indexed docIdHash,
        string caseId,
        string action,
        string actorId,
        string outcome,
        uint256 timestamp
    );

    // --- Modifiers ---
    modifier onlyAdmin() {
        require(isAdmin[msg.sender], "ProvenanceRegistry: caller not admin");
        _;
    }

    modifier onlyWriter() {
        require(isAdmin[msg.sender] || isWriter[msg.sender], "ProvenanceRegistry: unauthorized");
        _;
    }

    constructor() {
        isAdmin[msg.sender] = true;
        isWriter[msg.sender] = true;
        adminCount = 1;
        emit AdminAdded(msg.sender, msg.sender);
        emit WriterUpdated(msg.sender, true, msg.sender);
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

    function setWriter(address writer, bool authorized) external onlyAdmin {
        require(writer != address(0), "Zero address");
        isWriter[writer] = authorized;
        emit WriterUpdated(writer, authorized, msg.sender);
    }

    function authorizeWriter(address writer) external onlyAdmin {
        require(writer != address(0), "Zero address");
        isWriter[writer] = true;
        emit WriterUpdated(writer, true, msg.sender);
    }

    // ==========================================
    // PERMISSIONLESS CASE ANCHORING
    // Any wallet can call logCase() — no role required.
    // Anchors the case ID permanently on Polygon Amoy.
    // Emits CaseAnchored event (queryable by caseIdHash on Polygonscan).
    // ==========================================

    /**
     * @notice Anchors a case ID on-chain. Callable by ANY wallet (no roles needed).
     * @param caseId  The human-readable case ID (e.g. "CASE004")
     */
    function logCase(string calldata caseId) external {
        require(bytes(caseId).length > 0, "ProvenanceRegistry: empty caseId");
        bytes32 caseIdHash = keccak256(abi.encodePacked(caseId));

        if (!_caseAnchors[caseIdHash].exists) {
            _allCaseHashes.push(caseIdHash);
        }

        _caseAnchors[caseIdHash] = CaseAnchor({
            caseIdHash: caseIdHash,
            caseId: caseId,
            anchoredBy: msg.sender,
            anchoredAt: block.timestamp,
            exists: true
        });

        emit CaseAnchored(caseIdHash, caseId, msg.sender, block.timestamp);
    }

    function getCaseAnchor(string calldata caseId) external view returns (CaseAnchor memory) {
        bytes32 h = keccak256(abi.encodePacked(caseId));
        require(_caseAnchors[h].exists, "ProvenanceRegistry: case not anchored");
        return _caseAnchors[h];
    }

    function isCaseAnchored(string calldata caseId) external view returns (bool) {
        return _caseAnchors[keccak256(abi.encodePacked(caseId))].exists;
    }

    function getTotalCasesAnchored() external view returns (uint256) {
        return _allCaseHashes.length;
    }

    // ==========================================
    // CHAIN-OF-CUSTODY RECORDING (onlyWriter)
    // ==========================================

    struct EventInput {
        bytes32 eventId;
        bytes32 docIdHash;
        string caseId;
        string action;
        string actorId;
        string actorRole;
        string outcome;
        string reason;
    }

    function recordCustodyEvent(EventInput calldata input) external onlyWriter {
        require(_events[input.eventId].eventId == bytes32(0), "Event ID already exists");

        bytes32 prevHash = bytes32(0);
        uint256 chainLen = _docEventChain[input.docIdHash].length;
        if (chainLen > 0) {
            prevHash = _docEventChain[input.docIdHash][chainLen - 1];
        }

        _events[input.eventId] = CustodyEvent({
            eventId: input.eventId,
            docIdHash: input.docIdHash,
            caseId: input.caseId,
            action: input.action,
            actorId: input.actorId,
            actorRole: input.actorRole,
            outcome: input.outcome,
            reason: input.reason,
            timestamp: block.timestamp,
            prevEventHash: prevHash
        });

        _docEventChain[input.docIdHash].push(input.eventId);
        _caseEventChain[input.caseId].push(input.eventId);

        emit CustodyLogged(input.eventId, input.docIdHash, input.caseId, input.action, input.actorId, input.outcome, block.timestamp);
    }

    function getEvent(bytes32 eventId) external view returns (CustodyEvent memory) {
        require(_events[eventId].eventId != bytes32(0), "Event not found");
        return _events[eventId];
    }

    function getDocumentEvents(bytes32 docIdHash) public view returns (bytes32[] memory) {
        return _docEventChain[docIdHash];
    }

    function getDocumentHistory(bytes32 docIdHash) external view returns (bytes32[] memory) {
        return _docEventChain[docIdHash];
    }

    function verifyChainIntegrity(bytes32 docIdHash, bytes32 expectedLatestHash) external view returns (bool) {
        bytes32[] storage chain = _docEventChain[docIdHash];
        uint256 len = chain.length;
        if (len == 0) return false;
        if (chain[len - 1] != expectedLatestHash) return false;

        bytes32 expectedPrev = bytes32(0);
        for (uint256 i = 0; i < len; i++) {
            CustodyEvent storage ev = _events[chain[i]];
            if (ev.prevEventHash != expectedPrev) return false;
            expectedPrev = ev.eventId;
        }
        return true;
    }

    function getCaseEvents(string calldata caseId) external view returns (bytes32[] memory) {
        return _caseEventChain[caseId];
    }
}
