//SPDX-License-Identifier: MIT

// Layout of Contract:
// version
// imports
// errors
// interfaces, libraries, contracts
// Type declarations
// State variables
// Events
// Modifiers
// Functions

// Layout of Functions:
// constructor
// receive function (if exists)
// fallback function (if exists)
// external
// public
// internal
// private
// view & pure functions

pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "../interfaces/IReignCoin.sol";
import "./Constants.sol";

contract ReignCoin is Initializable, AccessControlUpgradeable, ERC20Upgradeable, IReignCoin {
    /////////////////////
    //Errors         ///
    ///////////////////
    error ReignCoin__InvalidStakingAddress();

    uint256 public override totalSupply;

    function initialize(address _reignProtocol) external override initializer {
        if (_reignProtocol != address(0)) {
            revert ReignCoin__InvalidStakingAddress();
        }
        __ERC20_init("Reign", "REIGN");
    }
}
