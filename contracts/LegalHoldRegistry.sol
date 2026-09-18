// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/ILegalHoldRegistry.sol";

/**
 * @title LegalHoldRegistry
 * @notice Provides enforceable statutory litigation holds blocking evidence modification
 */
contract LegalHoldRegistry is ILegalHoldRegistry {
    address public immutable judicialAuthority;
    mapping(string => HoldOrder) private _holds;

    modifier onlyJudicial() {
        require(msg.sender == judicialAuthority, "LHR: unauthorized judicial entity");
        _;
    }

    constructor() {
        judicialAuthority = msg.sender;
    }

    function imposeLegalHold(string calldata caseId, string calldata orderNumber, uint256 durationDays, string calldata jurisdiction) external override onlyJudicial returns (bool) {
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

    function liftLegalHold(string calldata caseId, string calldata) external override onlyJudicial returns (bool) {
        require(_holds[caseId].isActive, "LHR: hold not active");
        _holds[caseId].isActive = false;
        emit LegalHoldLifted(caseId, msg.sender);
        return true;
    }

    function isUnderLegalHold(string calldata caseId) external view override returns (bool) {
        HoldOrder memory hold = _holds[caseId];
        if (!hold.isActive) return false;
        if (block.timestamp > hold.expirationDate) return false;
        return true;
    }
}
