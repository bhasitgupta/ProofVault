// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title LegalHoldRegistry
 * @notice Statutory Litigation Hold & Court Order Enforcement Registry for Nyaya-Vault (Polygon Amoy).
 * Provides enforceable statutory litigation holds blocking evidence modification or shredding.
 * Governed by on-chain multi-admin architecture.
 */
contract LegalHoldRegistry {
    struct HoldOrder {
        string caseId;
        string courtOrderNumber;
        address presidingJudge;
        uint256 issuanceDate;
        uint256 expirationDate;
        bool isActive;
        string jurisdiction;
    }

    // --- On-Chain Multi-Admin & Judicial State ---
    mapping(address => bool) public isAdmin;
    uint256 public adminCount;
    mapping(address => bool) public isJudicialOfficer;

    mapping(string => HoldOrder) private _holds;

    // --- Events ---
    event AdminAdded(address indexed newAdmin, address indexed addedBy);
    event AdminRemoved(address indexed admin, address indexed removedBy);
    event JudicialOfficerUpdated(address indexed officer, bool authorized, address indexed updatedBy);
    event LegalHoldImposed(string indexed caseId, string orderNumber, address indexed judge);
    event LegalHoldLifted(string indexed caseId, address indexed judge, string reason);

    // --- Modifiers ---
    modifier onlyAdmin() {
        require(isAdmin[msg.sender], "LegalHoldRegistry: caller not admin");
        _;
    }

    modifier onlyJudicial() {
        require(isAdmin[msg.sender] || isJudicialOfficer[msg.sender], "LegalHoldRegistry: unauthorized judicial authority");
        _;
    }

    constructor() {
        isAdmin[msg.sender] = true;
        isJudicialOfficer[msg.sender] = true;
        adminCount = 1;
        emit AdminAdded(msg.sender, msg.sender);
        emit JudicialOfficerUpdated(msg.sender, true, msg.sender);
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

    function setJudicialOfficer(address officer, bool authorized) external onlyAdmin {
        require(officer != address(0), "Zero address");
        isJudicialOfficer[officer] = authorized;
        emit JudicialOfficerUpdated(officer, authorized, msg.sender);
    }

    // ==========================================
    // STATUTORY LEGAL HOLD ENFORCEMENT
    // ==========================================

    function imposeLegalHold(
        string calldata caseId,
        string calldata orderNumber,
        uint256 durationDays,
        string calldata jurisdiction
    ) external onlyJudicial returns (bool) {
        require(bytes(caseId).length > 0, "LHR: empty caseId");
        require(bytes(orderNumber).length > 0, "LHR: empty orderNumber");

        uint256 expiry = block.timestamp + (durationDays * 1 days);
        _holds[caseId] = HoldOrder({
            caseId: caseId,
            courtOrderNumber: orderNumber,
            presidingJudge: msg.sender,
            issuanceDate: block.timestamp,
            expirationDate: expiry,
            isActive: true,
            jurisdiction: jurisdiction
        });

        emit LegalHoldImposed(caseId, orderNumber, msg.sender);
        return true;
    }

    function liftLegalHold(string calldata caseId, string calldata reason) external onlyJudicial returns (bool) {
        require(_holds[caseId].isActive, "LHR: hold not active");
        _holds[caseId].isActive = false;
        emit LegalHoldLifted(caseId, msg.sender, reason);
        return true;
    }

    function isUnderLegalHold(string calldata caseId) external view returns (bool) {
        HoldOrder memory hold = _holds[caseId];
        if (!hold.isActive) return false;
        if (block.timestamp > hold.expirationDate) return false;
        return true;
    }

    function getLegalHold(string calldata caseId) external view returns (HoldOrder memory) {
        require(_holds[caseId].issuanceDate > 0, "LHR: no hold order found for case");
        return _holds[caseId];
    }
}
