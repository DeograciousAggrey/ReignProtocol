//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

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

    function addOpportunity(address _investor, bytes32 _opportunityId) external override {
        address poolAddress = opportunityManager.getOpportunityPoolAddress(_opportunityId);
        require(_investor != address(0), "Invalid Address");
        require(poolAddress != address(0), "Invalid Pool Address");
        require(msg.sender == poolAddress, "Invalid Caller");
        require(IOpportunityPool(poolAddress).isStaking(_investor), "Invalid Staker");
        bool exists = getInvestor(_investor, _opportunityId);
        if (!exists) {
            investorToOpportunity[_investor].push(_opportunityId);
        }
    }

    function removeOpportunity(address _investor, bytes32 _opportunityId) external override {
        address poolAddress = opportunityManager.getOpportunityPoolAddress(_opportunityId);
        require(_investor != address(0), "Invalid Address");
        require(poolAddress != address(0), "Invalid Pool Address");
        require(msg.sender == poolAddress, "Invalid Caller");
        require(IOpportunityPool(poolAddress).isStaking(_investor), "Invalid Staker");
        bool exists = getInvestor(_investor, _opportunityId);
        require(exists, "Not Found");

        bytes32[] memory opportunityIds = investorToOpportunity[_investor];
        for (uint256 i = 0; i < opportunityIds.length; i++) {
            if (opportunityIds[i] == _opportunityId) {
                investorToOpportunity[_investor][i] = investorToOpportunity[_investor][opportunityIds.length - 1];
                delete investorToOpportunity[_investor][opportunityIds.length - 1];
            }
        }
    }

    function getOpportunities(address _investor) external view override returns (bytes32[] memory) {
        require(_investor != address(0), "Invalid Address");
        bytes32[] memory opportunities = investorToOpportunity[_investor];
        return opportunities;
    }

    function getInvestor(address _investor, bytes32 _opportunityId) public view override returns (bool) {
        require(_investor != address(0), "Invalid Address");
        bytes32[] memory opportunities = investorToOpportunity[_investor];
        for (uint256 i = 0; i < opportunities.length; i++) {
            if (opportunities[i] == _opportunityId) {
                return true;
            }
        }
        return false;
    }
}
