// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "./ReignConfig.sol";
import "./ConfigOptions.sol";

/**
 * @title ConfigHelper
 * @notice A convenience library for getting easy access to other contracts and constants within the
 *  protocol.
 * @author Deogracious Aggrey
 */

library ConfigHelper {
    function dygnifyAdminAddress(ReignConfig config) internal view returns (address) {
        return config.getAddress(uint256(ConfigOptions.Addresses.ReignAdmin));
    }

    function usdcAddress(ReignConfig config) internal view returns (address) {
        return config.getAddress(uint256(ConfigOptions.Addresses.USDCToken));
    }

    function lpTokenAddress(ReignConfig config) internal view returns (address) {
        return config.getAddress(uint256(ConfigOptions.Addresses.LPToken));
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
        return config.getAddress(uint256(ConfigOptions.Addresses.OpportunityOrigination));
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

    function dygnifyTreasuryAddress(ReignConfig config) internal view returns (address) {
        return config.getAddress(uint256(ConfigOptions.Addresses.ReignTreasury));
    }

    function dygnifyKeeperAddress(ReignConfig config) internal view returns (address) {
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
