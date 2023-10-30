//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IReignCoin} from "../interfaces/IReignCoin.sol";
import {ReignConfig} from "./ReignConfig.sol";
import {BaseUpgradeablePausable} from "./BaseUpgradeablePausable.sol";
import {SafeMathUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {SafeERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import {IOpportunityManager} from "../interfaces/IOpportunityManager.sol";
import {IInvestor} from "../interfaces/IInvestor.sol";
import {IOpportunityPool} from "../interfaces/IOpportunityPool.sol";
import {IERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import {Constants} from "./Constants.sol";
import {Accounting} from "./Accounting.sol";
import {ISeniorPool} from "../interfaces/ISeniorPool.sol";

contract opportunityPool is BaseUpgradebalePausable, IOpportunityPool {
    ReignConfig public reignConfig;
    using ConfigHelper for ReignConfig;
    using SafeMathUpgradeable for uint256;
    using SafeERC20Upgradeable for IERC20;
    using SafeERC20 for IERC20;
    IOpportunityManager public opportunityManager;
    IInvestor public investor;

    IERC20 public usdcToken;
    IReignCoin public reignToken;

    bytes32 public s_opportunityID;
    uint8 public s_loanType;
    uint256 public s_loanAmount;
    uint256 public s_loanTenureInDays;
    uint256 public s_loanInterest;
    uint256 public s_paymentFrequencyInDays;
    uint256 public s_poolBalance;
    uint256 public s_repaymentStartTime;
    uint256 public s_repaymentCounter;
    uint256 public s_totalRepayments;
    uint256 public s_emiAmount;
    uint256 public s_dailyOverdueInterestRate;
    uint256 public s_totalRepaidAmount;
    uint256 public s_totalOutstandingPrincipal;
    uint256 public s_seniorYieldPercentage;
    uint256 public s_juniorYieldPercentage;
    uint256 public s_seniorOverduePercentage;
    uint256 public s_juniorOverduePercentage;
    bool public s_isDrawdownsPaused;


    mapping





































}
