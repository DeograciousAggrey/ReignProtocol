//SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

/**
 * @title IOpportunityManager
 * @author
 * @notice This interface defines the functions for the Opportunity Manager
 */
interface IOpportunityManager {
    enum OpportunityStatus {
        Active,
        Rejected,
        Collateralized,
        DrawnDown,
        Repaid,
        UnderReview,
        WriteOff,
        Approved,
        Doubtful
    }

    enum LoanType {
        BulletPaymentLoan,
        ArmotizedLoan
    }

    struct Opportunity {
        bytes32 opportunityId;
        address borrower;
        string opportunityName;
        string opportunityDescription;
        LoanType loanType;
        uint256 loanAmount;
        uint256 loanTermInDays;
        uint256 loanInterest;
        uint256 paymentFrequencyInDays;
        string collateralDocument;
        uint256 InvestmentLoss;
        OpportunityStatus opportunityStatus;
        address opportunityPoolAddress;
        uint256 createdAt;
    }

    struct CreateOpportunity {
        address borrower;
        string opportunityName;
        string opportunityDescription;
        LoanType loanType;
        uint256 loanAmount;
        uint256 loanTermInDays;
        uint256 loanInterest;
        uint256 paymentFrequencyInDays;
        string collateralDocument;
        uint256 InvestmentLoss;
    }

    function writeOffDaysOfLoan(bytes32 _opportunityId) external view returns (uint256);

    function getTotalOpporunities() external view returns (uint256);

    function getOpportunityOfBorrower(address _borrower) external view returns (bytes32[] memory);

    function createOpportunity(CreateOpportunity memory _createOpportunity) external;

    function assignUnderwriter(bytes32 _opportunityId, address _underwriter) external;

    function voteOnOpportunity(bytes32 _opportunityId, uint8 _status) external;

    function markDrawnDown(bytes32 _opportunityId) external;

    function isDrawndown(bytes32 _opportunityId) external view returns (bool);

    function markRepaid(bytes32 _opportunityId) external;

    function isRepaid(bytes32 _opportunityId) external view returns (bool);

    function markWriteOff(bytes32 _opportunityId, address _pool) external;

    function isWrittenOff(bytes32 _opportunityId) external view returns (bool);

    function isActive(bytes32 _opportunityId) external view returns (bool);

    function getBorrower(bytes32 _opportunityId) external view returns (address);

    function getOpportunityPoolAddress(bytes32 _opportunityId) external view returns (address);

    function getAllOpportunitiesOfBorrower(address _borrower) external view returns (bytes32[] memory);

    function getUnderwriterOpporunities(address _underwriter) external view returns (bytes32[] memory);

    function getOpportunityName(bytes32 _opportunityId) external view returns (string memory);
}
