//SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

/**
 * @title IInvestor
 * @notice This interface defines the functions to add and remove opportunities by the investor
 */
interface IInvestor {
    function addOpportunity(address _investor, bytes32 _opportunityId) external;

    function removeOpportunity(address _investor, bytes32 _opportunityId) external;

    function getOpportunities(address _investor) external view returns (bytes32[] memory);

    function getInvestor(address _investor, bytes32 _opportunityId) external view returns (bool);
}
