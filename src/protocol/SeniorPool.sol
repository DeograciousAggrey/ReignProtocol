//SPDX-License-Identifier: MIT

pragma solidity 0.8.4;

import {BaseUpgradeablePausable} from "./BaseUpgradeablePausable.sol";
import {ISeniorPool} from "../interfaces/ISeniorPool.sol";
import {IReignCoin} from "../interfaces/IReignCoin.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {SafeMathUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import {ReignConfig} from "./ReignConfig.sol";
import {IOpportunityManager} from "../interfaces/IOpportunityManager.sol";
import {IOpportunityPool} from "../interfaces/IOpportunityPool.sol";
import {ConfigOptions} from "../libraries/ConfigOptions.sol";
import {Constants} from "../Constants.sol";

contract SeniorPool is BaseUpgradeablePausable, ISeniorPool {
    using SafeMathUpgradeable for uint256;

    ReignConfig private reignConfig;

    using ConfigHelper for ReignConfig;

    IOpportunityManager private opportunityManager;

    struct InvestmentTimestamp {
        uint256 timestamp;
        uint256 amount;
    }

    struct KYC {
        bool isDocument;
        bool isLikeness;
        bool isAddress;
        bool isAML;
        bool imageHash;
        bool result;
    }

    /////////////////////////////////////////////////////////////////////////
    ////                        Mappings                                ////
    /////////////////////////////////////////////////////////////////////////

    mapping(address => InvestmentTimestamp[]) private s_stakingAmount;
    mapping(address => uint256) private s_availableToWithdraw;
    mapping(address => bool) public s_isStaking;
    mapping(address => uint256) private s_usdcYield;
    mapping(address => KYC) private s_kycOf;

    /////////////////////////////////////////////////////////////////////////
    ////                        State Variables                          ////
    /////////////////////////////////////////////////////////////////////////

    string public s_contractName = "SeniorPool";
    IERC20 private s_usdcToken;
    IReignCoin private s_reignToken;
    uint256 public s_investmentLockInMonths;
    uint256 public s_seniorPoolBalance;
    uint256 public s_sharePrice;

    /////////////////////////////////////////////////////////////////////////
    ////                        Events                                   ////
    /////////////////////////////////////////////////////////////////////////

    event Stake(address indexed from, uint256 amount);
    event Unstake(address indexed from, uint256 amount);
    event YieldWithdraw(address indexed to, uint256 amount);

    /////////////////////////////////////////////////////////////////////////
    ////                        Functions                                ////
    /////////////////////////////////////////////////////////////////////////

    function initialize(ReignConfig _reignConfig) public initializer {
        require(address(_reignConfig) != address(0), "SeniorPool: reignConfig cannot be zero address");

        reignConfig = _reignConfig;
        address owner = reignConfig.reignAdminAddress();
        require(owner != address(0), "SeniorPool: reignAdminAddress cannot be zero address");

        opportunityManager = IOpportunityManager(reignConfig.opportunityManagerAddress());

        _BaseUpgradeablePausable_init(owner);
        s_usdcToken = IERC20(reignConfig.usdcTokenAddress());
        s_reignToken = IReignCoin(reignConfig.reignTokenAddress());
        s_investmentLockInMonths = reignConfig.getSeniorPoolInvestmentLockInMonths();
        s_sharePrice = 0;
    }
}
