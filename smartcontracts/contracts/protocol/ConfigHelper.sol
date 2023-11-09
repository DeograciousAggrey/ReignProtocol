// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {ReignConfig} from "./ReignConfig.sol";
import {ConfigOptions} from "./ConfigOptions.sol";

/**
 * @title ConfigHelper
 * @notice A convenience library for getting easy access to other contracts and constants within the
 *  protocol.
 * @author Deogracious Aggrey
 */

library ConfigHelper {
    function reignAdminAddress(ReignConfig config) internal view returns (address) {
        return config.getAddress(uint256(ConfigOptions.Addresses.ReignAdmin));
    }

    function usdcAddress(ReignConfig config) internal view returns (address) {
        return config.getAddress(uint256(ConfigOptions.Addresses.USDCToken));
    }

    function reignCoinAddress(ReignConfig config) internal view returns (address) {
        return config.getAddress(uint256(ConfigOptions.Addresses.ReignCoin));
    }

    function seniorPoolAddress(ReignConfig config) internal view returns (address) {
        return config.getAddress(uint256(ConfigOptions.Addresses.SeniorPool));
    }

    function poolImplAddress(ReignConfig config) internal view returns (address) {
        return config.getAddress(uint256(ConfigOptions.Addresses.PoolImplAddress));
    }

    function collateralTokenAddress(ReignConfig config) internal view returns (address) {
        return config.getAddress(uint256(ConfigOptions.Addresses.CollateralToken));
    }

    function getLeverageRatio(ReignConfig config) internal view returns (uint256) {
        return config.getNumber(uint256(ConfigOptions.Numbers.LeverageRatio));
    }

    function getOverDueFee(ReignConfig config) internal view returns (uint256) {
        return config.getNumber(uint256(ConfigOptions.Numbers.OverDueFee));
    }

    function getSeniorPoolLockinMonths(ReignConfig config) internal view returns (uint256) {
        return config.getNumber(uint256(ConfigOptions.Numbers.SeniorPoolFundLockinMonths));
    }

    function getOpportunityOrigination(ReignConfig config) internal view returns (address) {
        return config.getAddress(uint256(ConfigOptions.Addresses.OpportunityManager));
    }

    function getReignFee(ReignConfig config) internal view returns (uint256) {
        return config.getNumber(uint256(ConfigOptions.Numbers.ReignFee));
    }

    function getJuniorSubpoolFee(ReignConfig config) internal view returns (uint256) {
        return config.getNumber(uint256(ConfigOptions.Numbers.JuniorSubpoolFee));
    }

    function investorContractAddress(ReignConfig config) internal view returns (address) {
        return config.getAddress(uint256(ConfigOptions.Addresses.InvestorContract));
    }

    function reignTreasuryAddress(ReignConfig config) internal view returns (address) {
        return config.getAddress(uint256(ConfigOptions.Addresses.ReignTreasury));
    }

    function reignKeeperAddress(ReignConfig config) internal view returns (address) {
        return config.getAddress(uint256(ConfigOptions.Addresses.ReignKeeper));
    }

    function identityTokenAddress(ReignConfig config) internal view returns (address) {
        return config.getAddress(uint256(ConfigOptions.Addresses.IdentityToken));
    }

    function getWriteOffDays(ReignConfig config) internal view returns (uint256) {
        return config.getNumber(uint256(ConfigOptions.Numbers.WriteOffDays));
    }

    function getAdjustmentOffset(ReignConfig config) internal view returns (uint256) {
        return config.getNumber(uint256(ConfigOptions.Numbers.AdjustmentOffset));
    }
}
