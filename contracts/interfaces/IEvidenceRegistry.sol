// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IEvidenceRegistry
 * @notice Standard interface for recording immutable digital evidence on Polygon Amoy
 */
interface IEvidenceRegistry {
    enum IntegrityTier { UNVERIFIED, STANDARD, HARDENED, SOVEREIGN }

    struct EvidenceRecord {
        bytes32 docHash;
        bytes32 merkleRoot;
        string caseId;
        string classification;
        address custodian;
        uint256 timestamp;
        IntegrityTier tier;
        bool exists;
    }

    event EvidenceRegistered(bytes32 indexed docHash, string indexed caseId, address indexed custodian, uint256 timestamp);
    event EvidenceIntegrityUpgraded(bytes32 indexed docHash, IntegrityTier newTier);

    function registerEvidence(bytes32 docHash, bytes32 merkleRoot, string calldata caseId, string calldata classification, IntegrityTier tier) external returns (bool);
    function verifyEvidence(bytes32 docHash) external view returns (bool exists, uint256 timestamp, address custodian, string memory caseId);
    function getEvidence(bytes32 docHash) external view returns (EvidenceRecord memory);
}
