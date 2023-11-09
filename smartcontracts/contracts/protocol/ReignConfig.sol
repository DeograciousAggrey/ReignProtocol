//SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {BaseUpgradeablePausable} from "./BaseUpgradeablePausable.sol";
import {ConfigHelper} from "./ConfigHelper.sol";

contract ReignConfig is BaseUpgradeablePausable {
    mapping(uint256 => address) public addresses;
    mapping(uint256 => uint256) public numbers;
    mapping(bytes32 => bool) public flag;

    using ConfigHelper for ReignConfig;

    function initialize() public initializer {
        require(msg.sender != address(0), "Invalid Sender Address");
        _BaseUpgradeablePausable_init(msg.sender);
        setAddress(0, msg.sender);
    }

    function setAddress(uint256 indexAddress, address newAddress) public onlyAdmin nonReentrant {
        require(address(newAddress) != address(0), "Invalid Address");
        addresses[indexAddress] = newAddress;
    }

    function getAddress(uint256 indexAddress) public view returns (address) {
        return addresses[indexAddress];
    }

    function setNumber(uint256 id, uint256 newNumber) public onlyAdmin nonReentrant {
        numbers[id] = newNumber;
    }

    function getNumber(uint256 id) public view returns (uint256) {
        return numbers[id];
    }

    function setFlag(bytes32 indexFlag, bool isFlag) public onlyAdmin nonReentrant {
        flag[indexFlag] = isFlag;
    }

    function getFlag(bytes32 indexFlag) public view returns (bool) {
        return flag[indexFlag];
    }
}
