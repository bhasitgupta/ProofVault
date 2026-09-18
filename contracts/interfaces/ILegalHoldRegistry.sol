// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ILegalHoldRegistry
 * @notice Interface for court-ordered evidentiary preservation freezes
 */
interface ILegalHoldRegistry {
    struct HoldOrder {
        string caseId;
        string courtOrderNumber;
        address presidingJudge;
        uint256 issuanceDate;
        uint256 expirationDate;
        bool isActive;
        string jurisdiction;
    }

    event LegalHoldImposed(string indexed caseId, string indexed orderNumber, address indexed judge);
    event LegalHoldLifted(string indexed caseId, address indexed authorizedOfficer);

    function imposeLegalHold(string calldata caseId, string calldata orderNumber, uint256 durationDays, string calldata jurisdiction) external returns (bool);
    function liftLegalHold(string calldata caseId, string calldata liftingReason) external returns (bool);
    function isUnderLegalHold(string calldata caseId) external view returns (bool);
}
