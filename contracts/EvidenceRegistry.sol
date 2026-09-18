// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title EvidenceRegistry
 * @dev Nyaya-Vault Electronic Evidence Registry for Polygon Amoy / EVM
 * Anchors document Merkle roots, plaintext hashes, and metadata for BSA §63 admissibility.
 */
contract EvidenceRegistry {
    enum Classification { RESTRICTED, CONFIDENTIAL, SECRET }

    struct EvidenceRecord {
        bytes32 docIdHash;
        bytes32 merkleRoot;
        bytes32 contentHash;
        bytes32 blobHash;
        string caseId;
        Classification classification;
        uint256 chunkCount;
        uint256 registeredAt;
        address registrar;
        bool exists;
    }

    address public owner;
    mapping(address => bool) public authorizedRegistrars;
    mapping(bytes32 => EvidenceRecord) private _evidence;
    bytes32[] private _allDocHashes;

    event EvidenceRegistered(
        bytes32 indexed docIdHash,
        bytes32 indexed merkleRoot,
        string caseId,
        Classification classification,
        uint256 chunkCount,
        uint256 timestamp,
        address indexed registrar
    );

    event RegistrarAuthorized(address indexed registrar);
    event RegistrarRevoked(address indexed registrar);

    modifier onlyOwner() {
        require(msg.sender == owner, "EvidenceRegistry: caller is not the owner");
        _;
    }

    modifier onlyRegistrar() {
        require(msg.sender == owner || authorizedRegistrars[msg.sender], "EvidenceRegistry: caller not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedRegistrars[msg.sender] = true;
    }

    function authorizeRegistrar(address registrar) external onlyOwner {
        require(registrar != address(0), "Invalid address");
        authorizedRegistrars[registrar] = true;
        emit RegistrarAuthorized(registrar);
    }

    function revokeRegistrar(address registrar) external onlyOwner {
        authorizedRegistrars[registrar] = false;
        emit RegistrarRevoked(registrar);
    }

    function registerEvidence(
        bytes32 docIdHash,
        bytes32 merkleRoot,
        bytes32 contentHash,
        bytes32 blobHash,
        string calldata caseId,
        Classification classification,
        uint256 chunkCount
    ) external onlyRegistrar {
        require(!_evidence[docIdHash].exists, "EvidenceRegistry: document already registered");
        require(merkleRoot != bytes32(0), "EvidenceRegistry: invalid merkle root");

        _evidence[docIdHash] = EvidenceRecord({
            docIdHash: docIdHash,
            merkleRoot: merkleRoot,
            contentHash: contentHash,
            blobHash: blobHash,
            caseId: caseId,
            classification: classification,
            chunkCount: chunkCount,
            registeredAt: block.timestamp,
            registrar: msg.sender,
            exists: true
        });

        _allDocHashes.push(docIdHash);

        emit EvidenceRegistered(
            docIdHash,
            merkleRoot,
            caseId,
            classification,
            chunkCount,
            block.timestamp,
            msg.sender
        );
    }

    function getEvidence(bytes32 docIdHash) external view returns (EvidenceRecord memory) {
        require(_evidence[docIdHash].exists, "EvidenceRegistry: evidence not found");
        return _evidence[docIdHash];
    }

    function verifyMerkleRoot(bytes32 docIdHash, bytes32 candidateRoot) external view returns (bool) {
        if (!_evidence[docIdHash].exists) return false;
        return _evidence[docIdHash].merkleRoot == candidateRoot;
    }

    function getTotalEvidenceCount() external view returns (uint256) {
        return _allDocHashes.length;
    }
}
