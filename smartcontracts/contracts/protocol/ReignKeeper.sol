//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {BaseUpgradeablePausable} from "./BaseUpgradeablePausable.sol";
import {KeeperCompatibleInterface} from "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";
import {IReignKeeper} from "../interfaces/IReignKeeper.sol";
import {ReignConfig} from "./ReignConfig.sol";
import {IOpportunityManager} from "../interfaces/IOpportunityManager.sol";
import {IOpportunityPool} from "../interfaces/IOpportunityPool.sol";
import {ConfigHelper} from "./ConfigHelper.sol";

contract ReignKeeper is BaseUpgradeablePausable, KeeperCompatibleInterface, IReignKeeper {
    ReignConfig public reignConfig;

    using ConfigHelper for ReignConfig;

    IOpportunityManager private opportunityManager;

    bytes32[] private s_drawdownOpportunities;
    bool private s_stopKeeper;

    function initialize(ReignConfig _reignConfig) public initializer {
        require(address(_reignConfig) != address(0), "ReignKeeper: reignConfig is zero address");
        reignConfig = _reignConfig;
        address owner = reignConfig.reignAdminAddress();
        require(owner != address(0), "ReignKeeper: owner is zero address");

        opportunityManager = IOpportunityManager(reignConfig.getOpportunityOrigination());

        _BaseUpgradeablePausable_init(owner);
    }

    function checkUpkeep(bytes calldata /* checkData */ )
        external
        override
        returns (bool upkeepNeeded, bytes memory /* performData */ )
    {
        bool isUpkeepNeeded;

        for (uint256 i = 0; i < s_drawdownOpportunities.length; i++) {
            uint256 dueTime = IOpportunityPool(opportunityManager.getOpportunityPoolAddress(s_drawdownOpportunities[i]))
                .nextRepaymentTime();
            if (dueTime < block.timestamp) {
                uint256 opportunityThreshold = opportunityManager.writeOffDaysOfLoan(s_drawdownOpportunities[i]) * 86400;
                uint256 timeSinceLastPayment = block.timestamp - dueTime;
                if (timeSinceLastPayment > opportunityThreshold) {
                    isUpkeepNeeded = true;
                    break;
                }
            }
        }
        upkeepNeeded = s_stopKeeper ? false : isUpkeepNeeded;
    }

    function performUpkeep(bytes calldata /* performData */ ) external override nonReentrant {
        s_stopKeeper = true;
        for (uint256 i = 0; i < s_drawdownOpportunities.length; i++) {
            uint256 dueTime = IOpportunityPool(opportunityManager.getOpportunityPoolAddress(s_drawdownOpportunities[i]))
                .nextRepaymentTime();
            if (dueTime < block.timestamp) {
                uint256 opportunityThreshold = opportunityManager.writeOffDaysOfLoan(s_drawdownOpportunities[i]) * 86400;
                uint256 timeSinceLastPayment = block.timestamp - dueTime;
                if (timeSinceLastPayment > opportunityThreshold) {
                    opportunityManager.markWriteOff(
                        s_drawdownOpportunities[i],
                        opportunityManager.getOpportunityPoolAddress(s_drawdownOpportunities[i])
                    );
                    s_drawdownOpportunities[i] = s_drawdownOpportunities[s_drawdownOpportunities.length - 1];
                    delete s_drawdownOpportunities[s_drawdownOpportunities.length - 1];
                }
            }
        }
        s_stopKeeper = false;
    }

    function addOpportunityInKeeper(bytes32 _opportunityId) external override {
        require(opportunityManager.isDrawndown(_opportunityId) == true, "ReignKeeper: opportunity is not drawn down");
        require(msg.sender == reignConfig.getOpportunityOrigination(), "ReignKeeper: caller is not opportunity manager");
        s_drawdownOpportunities.push(_opportunityId);
    }

    function removeOpportunityFromKeeper(bytes32 _opportunityId) external override {
        require(msg.sender == reignConfig.getOpportunityOrigination(), "ReignKeeper: caller is not opportunity manager");
        for (uint256 i = 0; i < s_drawdownOpportunities.length; i++) {
            if (s_drawdownOpportunities[i] == _opportunityId) {
                s_drawdownOpportunities[i] = s_drawdownOpportunities[s_drawdownOpportunities.length - 1];
                delete s_drawdownOpportunities[s_drawdownOpportunities.length - 1];
                break;
            }
        }
    }
}
