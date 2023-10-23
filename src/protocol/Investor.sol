//SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import {BaseUpgradeablePausable} from "./BaseUpgradeablePausable.sol";
import {IInvestor} from "../interfaces/IInvestor.sol";
import {ReignConfig} from "./ReignConfig.sol";
import {IOpportunityManager} from "../interfaces/IOpportunityManager.sol";
import {IOpportunityPool} from "../interfaces/IOpportunityPool.sol";
import {ConfigHelper} from "./ConfigHelper.sol";

contract Investor is BaseUpgradeablePausable, IInvestor {
    ReignConfig public reignConfig;

    using ConfigHelper for ReignConfig;

    IOpportunityManager public opportunityManager;

    mapping(address => bytes32[]) public investorToOpportunity;

    function initialize(ReignConfig _reignConfig) external initializer {
        require(address(_reignConfig) != address(0), "Invalid Address");
        reignConfig = _reignConfig;
        address owner = reignConfig.reignAdminAddress();
        require(owner != address(0), "Invalid Owner Address");
        opportunityManager = IOpportunityManager(reignConfig.getOpportunityOrigination());
        _BaseUpgradeablePausable_init(owner);
    }

    function addOpportunity(address _investor, bytes32 _opportunityId) external override {}
}
