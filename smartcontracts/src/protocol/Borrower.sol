//SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {BaseUpgradeablePausable} from "./BaseUpgradeablePausable.sol";
import {ReignConfig} from "./ReignConfig.sol";
import {ConfigHelper} from "./ConfigHelper.sol";

contract Borrower is BaseUpgradeablePausable {
    ReignConfig private reignConfig;

    using ConfigHelper for ReignConfig;

    mapping(address => string) public borrowerProfile;

    function initialize(ReignConfig _reignConfig) external initializer {
        require(address(_reignConfig) != address(0), "Invalid ReignConfig Address");
        reignConfig = ReignConfig(_reignConfig);
        address owner = reignConfig.reignAdminAddress();
        require(owner != address(0), "Invalid Owner Address");
        _BaseUpgradeablePausable_init(owner);
    }

    function updateBorrowerProfile(string calldata _cid) external {
        require(bytes(_cid).length != 0, "Invalid CID");
        borrowerProfile[msg.sender] = _cid;
    }
}
