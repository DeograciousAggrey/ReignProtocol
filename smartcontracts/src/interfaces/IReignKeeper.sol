//SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

/**
 * @title IReignKeeper
 * @notice This interface defines the functions to add and remove opportunities from the keeper
 */
interface IReignKeeper {
    function addOpportunityInKeeper(bytes32 _opportunityId) external;
    function removeOpportunityFromKeeper(bytes32 _opportunityId) external;
}
