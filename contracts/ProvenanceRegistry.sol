// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ProvenanceRegistry
 * @notice Cryptographic Chain-of-Custody & Forensic Audit Trail for Nyaya-Vault (Polygon Amoy).
 * Records sequential, cryptographically linked transfer and access events across institutional agencies.
 * Governed by on-chain multi-admin architecture.
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

    // --- On-Chain Multi-Admin & Role State ---
    mapping(address => bool) public isAdmin;
    uint256 public adminCount;
    mapping(address => bool) public isWriter;

    // --- Event Storage ---
    mapping(bytes32 => CustodyEvent) private _events;
    mapping(bytes32 => bytes32[]) private _docEventChain;
    mapping(string => bytes32[]) private _caseEventChain;

    // --- Events ---
    event AdminAdded(address indexed newAdmin, address indexed addedBy);
    event AdminRemoved(address indexed admin, address indexed removedBy);
    event WriterUpdated(address indexed writer, bool authorized, address indexed updatedBy);

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

    // ==========================================
    // CHAIN-OF-CUSTODY RECORDING
    // ==========================================

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

    function getDocumentEvents(bytes32 docIdHash) external view returns (bytes32[] memory) {
        return _docEventChain[docIdHash];
    }

    function getCaseEvents(string calldata caseId) external view returns (bytes32[] memory) {
        return _caseEventChain[caseId];
    }
}
