//SPDX-License-Identifier: MIT

pragma solidity 0.8.4;

import {BaseUpgradeablePausable} from "./BaseUpgradeablePausable.sol";
import {ReignConfig} from "./ReignConfig.sol";
import {ConfigHelper} from "./ConfigHelper.sol";

contract Borrower is BaseUpgradeablePausable {
    ReignConfig private reignConfig;

    using ConfigHelper for ReignConfig;

    function initialize(ReignConfig _reignConfig) external initializer {
        require(address(_reignConfig) != address(0), "Invalid ReignConfig Address");
        reignConfig = ReignConfig(_reignConfig);
        address owner = reignConfig.reignAdminAddress();
        require(owner != address(0), "Invalid Owner Address");
        _BaseUpgradeablePausable_init(owner);
    }
}
