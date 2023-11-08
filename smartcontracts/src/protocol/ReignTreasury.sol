//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {BaseUpgradeablePausable} from "./BaseUpgradeablePausable.sol";
import {ConfigHelper} from "./ConfigHelper.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {multiSigWallet} from "./MultiSign.sol";
import {ReignConfig} from "./ReignConfig.sol";

contract ReignTreasury is BaseUpgradeablePausable {
    using SafeERC20 for IERC20;
    using ConfigHelper for ReignConfig;

    ReignConfig public reignConfig;
    IERC20 public usdcToken;
    address wallet;

    function setWallet(address _wallet) public onlyAdmin {
        wallet = _wallet;
    }

    function initialize(ReignConfig _reignConfig) external initializer {
        require(address(_reignConfig) != address(0), "Invalid Address");
        reignConfig = _reignConfig;
        address owner = reignConfig.reignAdminAddress();
        require(owner != address(0), "Invalid Owner Address");
        _BaseUpgradeablePausable_init(owner);
        usdcToken = IERC20(reignConfig.usdcAddress());
    }

    function getTreasuryBalance() public view returns (uint256) {
        uint256 balance = usdcToken.balanceOf(address(this));
        return balance;
    }

    function withdraw(address to, uint256 amount) public nonReentrant whenNotPaused onlyAdmin {
        require(amount > 0, "Amount Should be greater than zero");
        require(msg.sender == wallet, "Only wallet can withdraw");
        uint256 totalBalance = getTreasuryBalance();
        require(totalBalance >= amount, "Insufficient Balance");
        usdcToken.safeTransferFrom(address(this), to, amount);
    }
}
