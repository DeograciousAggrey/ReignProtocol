//SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import {ReignConfig} from "../protocol/ReignConfig.sol";

interface ISeniorPool {
    function withdrawFromOpportunity(bool _isWriteOff, bytes32 _opportunityId, uint256 _amount) external;
}
