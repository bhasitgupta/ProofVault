// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ProvenanceRegistry
 * @dev Nyaya-Vault Chain of Custody & Audit Trail Contract for Polygon Amoy
 * Records sequential, cryptographically linked custody transactions.
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

    address public owner;
    mapping(address => bool) public authorizedWriters;
    mapping(bytes32 => CustodyEvent) private _events;
    mapping(bytes32 => bytes32[]) private _docEventChain;
    mapping(string => bytes32[]) private _caseEventChain;

    event CustodyLogged(
        bytes32 indexed eventId,
        bytes32 indexed docIdHash,
        string caseId,
        string action,
        string actorId,
        string outcome,
        uint256 timestamp
    );

    modifier onlyWriter() {
        require(msg.sender == owner || authorizedWriters[msg.sender], "ProvenanceRegistry: unauthorized");
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedWriters[msg.sender] = true;
    }

    function authorizeWriter(address writer) external {
        require(msg.sender == owner, "Only owner");
        authorizedWriters[writer] = true;
    }

    function recordCustodyEvent(
        bytes32 eventId,
        bytes32 docIdHash,
        string calldata caseId,
        string calldata action,
        string calldata actorId,
        string calldata actorRole,
        string calldata outcome,
        string calldata reason
    ) external onlyWriter {
        require(_events[eventId].eventId == bytes32(0), "Event ID already exists");

        bytes32 prevHash = bytes32(0);
        bytes32[] storage docChain = _docEventChain[docIdHash];
        if (docChain.length > 0) {
            prevHash = docChain[docChain.length - 1];
        }

        CustodyEvent memory evt = CustodyEvent({
            eventId: eventId,
            docIdHash: docIdHash,
            caseId: caseId,
            action: action,
            actorId: actorId,
            actorRole: actorRole,
            outcome: outcome,
            reason: reason,
            timestamp: block.timestamp,
            prevEventHash: prevHash
        });

        _events[eventId] = evt;
        _docEventChain[docIdHash].push(eventId);
        _caseEventChain[caseId].push(eventId);

        emit CustodyLogged(eventId, docIdHash, caseId, action, actorId, outcome, block.timestamp);
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
