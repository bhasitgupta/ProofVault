// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IAccessControlRegistry
 * @notice Institutional role-based permission registry for judiciary and police departments
 */
interface IAccessControlRegistry {
    bytes32 constant INVESTIGATOR_ROLE = keccak256("INVESTIGATOR_ROLE");
    bytes32 constant FORENSIC_EXAMINER_ROLE = keccak256("FORENSIC_EXAMINER_ROLE");
    bytes32 constant JUDICIAL_MAGISTRATE_ROLE = keccak256("JUDICIAL_MAGISTRATE_ROLE");
    bytes32 constant AUDIT_CONTROLLER_ROLE = keccak256("AUDIT_CONTROLLER_ROLE");

    event ClearanceGranted(address indexed officer, bytes32 indexed role, address indexed granter);
    event ClearanceRevoked(address indexed officer, bytes32 indexed role, address indexed revoker);

    function hasClearance(address officer, bytes32 role) external view returns (bool);
    function grantClearance(address officer, bytes32 role) external;
    function revokeClearance(address officer, bytes32 role) external;
}
