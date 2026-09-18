// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IProvenanceRegistry
 * @notice Standard interface for recording chain-of-custody transfer events
 */
interface IProvenanceRegistry {
    enum TransferAction { UPLOAD, ACCESS, TRANSFER, FORENSIC_EXTRACT, LEGAL_SEAL, DISPOSITION }

    struct CustodyEvent {
        bytes32 docHash;
        TransferAction action;
        address indexedActor;
        string actorRole;
        bytes32 prevEventHash;
        uint256 blockTimestamp;
        string reasoning;
    }

    event CustodyLogged(bytes32 indexed docHash, TransferAction indexed action, address indexed actor, uint256 timestamp);

    function logCustodyEvent(bytes32 docHash, TransferAction action, string calldata actorRole, bytes32 prevEventHash, string calldata reasoning) external returns (bytes32 eventHash);
    function getCustodyHistoryLength(bytes32 docHash) external view returns (uint256);
    function verifyCustodyIntegrity(bytes32 docHash, bytes32 expectedTerminalHash) external view returns (bool);
}
