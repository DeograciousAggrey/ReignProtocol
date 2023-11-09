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

pragma solidity ^0.8.20;

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

    uint256 public override totalShares;

    function initialize(address _reignProtocol) external override initializer {
        if (_reignProtocol != address(0)) {
            revert ReignCoin__InvalidStakingAddress();
        }
        __ERC20_init("Reign", "REIGN");
        _setupRole(Constants.getOwnerRole(), _reignProtocol);
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function decimals() public view virtual override returns (uint8) {
        return 6;
    }

    function mint(address _to, uint256 _amount) public override {
        require(hasRole(Constants.getOwnerRole(), msg.sender), "Caller is not an owner");
        totalShares += _amount;
        _mint(_to, _amount);
    }

    function burn(address _from, uint256 _amount) public override {
        require(hasRole(Constants.getOwnerRole(), msg.sender), "Caller is not an owner");
        totalShares -= _amount;
        _burn(_from, _amount);
    }
}
