//SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {ReignConfig} from "../protocol/ReignConfig.sol";
/**
 * @title Opportunity Pool Interface
 * @author
 * @notice This contract is used to define the interface for the Senior Pool
 */

interface ISeniorPool {
    function withdrawFromOpportunity(bool _isWriteOff, bytes32 _opportunityId, uint256 _amount) external;
}
