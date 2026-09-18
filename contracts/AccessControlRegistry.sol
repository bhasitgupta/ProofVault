// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IAccessControlRegistry.sol";

/**
 * @title AccessControlRegistry
 * @notice Institutional role registry enforcing zero-trust role-based security boundaries
 */
contract AccessControlRegistry is IAccessControlRegistry {
    address public immutable superAdmin;
    mapping(bytes32 => mapping(address => bool)) private _roles;

    modifier onlyAdmin() {
        require(msg.sender == superAdmin, "ACR: caller is not super admin");
        _;
    }

    constructor() {
        superAdmin = msg.sender;
        _roles[AUDIT_CONTROLLER_ROLE][msg.sender] = true;
    }

    function hasClearance(address officer, bytes32 role) external view override returns (bool) {
        return _roles[role][officer];
    }

    function grantClearance(address officer, bytes32 role) external override onlyAdmin {
        require(officer != address(0), "ACR: zero address officer");
        _roles[role][officer] = true;
        emit ClearanceGranted(officer, role, msg.sender);
    }

    function revokeClearance(address officer, bytes32 role) external override onlyAdmin {
        _roles[role][officer] = false;
        emit ClearanceRevoked(officer, role, msg.sender);
    }
}
