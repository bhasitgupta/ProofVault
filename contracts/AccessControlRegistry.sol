// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AccessControlRegistry
 * @notice Institutional Zero-Trust Role & Clearance Registry for Nyaya-Vault (Polygon Amoy).
 * Enforces cross-pillar institutional clearance boundaries across Police, Forensics, Prosecution, and Judiciary.
 * Governed by on-chain decentralized multi-admin architecture.
 */
contract AccessControlRegistry {
    bytes32 public constant INVESTIGATOR_ROLE = keccak256("INVESTIGATOR_ROLE");
    bytes32 public constant FORENSIC_ANALYST_ROLE = keccak256("FORENSIC_ANALYST_ROLE");
    bytes32 public constant LEGAL_OFFICER_ROLE = keccak256("LEGAL_OFFICER_ROLE");
    bytes32 public constant JUDICIAL_ROLE = keccak256("JUDICIAL_ROLE");
    bytes32 public constant AUDIT_CONTROLLER_ROLE = keccak256("AUDIT_CONTROLLER_ROLE");

    // --- On-Chain Multi-Admin State ---
    mapping(address => bool) public isAdmin;
    uint256 public adminCount;

    // --- Clearance State ---
    mapping(bytes32 => mapping(address => bool)) private _roles;

    // --- Events ---
    event AdminAdded(address indexed newAdmin, address indexed addedBy);
    event AdminRemoved(address indexed admin, address indexed removedBy);
    event ClearanceGranted(address indexed officer, bytes32 indexed role, address indexed grantedBy);
    event ClearanceRevoked(address indexed officer, bytes32 indexed role, address indexed revokedBy);

    // --- Modifiers ---
    modifier onlyAdmin() {
        require(isAdmin[msg.sender], "ACR: caller not admin");
        _;
    }

    constructor() {
        isAdmin[msg.sender] = true;
        adminCount = 1;
        _roles[AUDIT_CONTROLLER_ROLE][msg.sender] = true;
        emit AdminAdded(msg.sender, msg.sender);
        emit ClearanceGranted(msg.sender, AUDIT_CONTROLLER_ROLE, msg.sender);
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

    // ==========================================
    // INSTITUTIONAL CLEARANCE MANAGEMENT
    // ==========================================

    function hasClearance(address officer, bytes32 role) external view returns (bool) {
        return _roles[role][officer] || isAdmin[officer];
    }

    function grantClearance(address officer, bytes32 role) external onlyAdmin {
        require(officer != address(0), "ACR: zero address officer");
        _roles[role][officer] = true;
        emit ClearanceGranted(officer, role, msg.sender);
    }

    function revokeClearance(address officer, bytes32 role) external onlyAdmin {
        _roles[role][officer] = false;
        emit ClearanceRevoked(officer, role, msg.sender);
    }
}
