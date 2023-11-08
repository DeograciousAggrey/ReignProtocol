//SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {ReignConfig} from "../protocol/ReignConfig.sol";
/**
 * @title Opportunity Pool Interface
 * @author
 * @notice this contract is used to define the interface for the Opportunity Pool
 */

interface IOpportunityPool {
    enum SubPool {
        JuniorSubpool,
        SeniorSubpool
    }

    struct SubPoolDetails {
        uint256 subPoolId;
        uint256 totalDepositable;
        uint256 depositedAmount;
        bool isPoolLocked;
        uint256 fundsLockedTill;
        uint256 yieldGenerated;
        uint256 overdueGenerated;
    }

    function isStaking(address _investor) external view returns (bool);

    function initialize(
        ReignConfig _reignConfig,
        bytes32 _opportunityId,
        uint256 _loanAmount,
        uint256 _loanTermInDays,
        uint256 _loanInterest,
        uint256 _paymentIntervalInDays,
        uint8 _loanType
    ) external;

    function deposit(uint8 _subPoolId, uint256 _amount) external;

    function drawdown() external;

    function repayment() external;

    function withdrawAll(uint8) external returns (uint256);

    function getUserWithdrawableAmount() external view returns (uint256);

    function getRepaymentAmount() external view returns (uint256);

    function getOverDuePercentage() external view returns (uint256, uint256);

    function nextRepaymentTime() external view returns (uint256);

    function getSeniorTotalDepositable() external view returns (uint256);

    function getSeniorProfit() external view returns (uint256);

    function getOpportunityName() external view returns (string memory);

    function writeOffOpportunity() external;

    function getSeniorPoolWithdrawableAmount() external view returns (uint256);
}
