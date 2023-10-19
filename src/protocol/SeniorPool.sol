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

    /**
     *
     * @param amount the amount of USDC to stake
     * @notice stake USDC to the Senior Pool
     * @dev if user has staked before, the amount will be added to the existing stake
     */

    function stake(uint256 amount) external {
        require(amount > 0 && s_usdcToken.balanceOf(msg.sender) >= amount, "SeniorPool: insufficient USDC balance");
        s_stakingAmount[msg.sender].push(InvestmentTimestamp(block.timestamp, amount));
        s_isStaking[msg.sender] = true;
        s_seniorPoolBalance = s_seniorPoolBalance.add(amount);
        s_usdcToken.transferFrom(msg.sender, address(this), amount);
        address minter = msg.sender;
        s_reignToken.mint(minter, amount);
        emit Stake(msg.sender, amount);
    }

    /**
     *
     * @notice Only Admin withdraws to an address some amount of USDC staked
     *
     *
     */
    function withdrawTo(uint256 amount, address _receiver) public onlyAdmin {
        require(amount > 0 && s_usdcToken.balanceOf(address(this)) >= amount, "SeniorPool: insufficient USDC balance");
        s_usdcToken.transfer(_receiver, amount);
        s_seniorPoolBalance = s_seniorPoolBalance.sub(amount);
    }

    function invest(bytes32 opportunityId) public onlyAdmin {
        require(opportunityManager.isActive(opportunityId), "SeniorPool: opportunity is not active");

        //Check whether opportunity is already funded by senior pool
        address poolAddress = opportunityManager.getOpportunityPoolAddress(opportunityId);
        IOpportunityPool opportunitypool = IOpportunityPool(poolAddress);
        uint256 amount = opportunitypool.getSeniorPoolTotalDepositable();

        //Check whether senior pool has enough balance to fund the opportunity
        require(s_seniorPoolBalance >= amount, "SeniorPool: insufficient senior pool balance");
        s_seniorPoolBalance = s_seniorPoolBalance.sub(amount);
        //Transfer USDC from senior pool to opportunity pool
        opportunitypool.deposit(1, amount);
    }

    function withdrawFromOpportunity(bool _isWriteOff, bytes32 opportunityId, uint256 amount) public override {
        require(
            opportunityManager.isRepaid(opportunityId) == true || _isWriteOff == true,
            "SeniorPool: opportunity is not repaid"
        );
        address poolAddress = opportunityManager.getOpportunityPoolAddress(opportunityId);
        IOpportunityPool opportunitypool = IOpportunityPool(poolAddress);
        require(msg.sender == poolAddress, "SeniorPool: caller is not opportunity pool");

        //Calculate share price
        uint256 totalprofit;
        if (_isWriteOff == true) totalprofit = _amount;
        else totalprofit = opportunitypool.getSeniorProfit();
        uint256 totalShares = s_reignToken.totalSupply();
        uint256 delta = totalprofit.mul(lpMantissa).div(totalShares);
        s_sharePrice = s_sharePrice.add(delta);

        if (_isWriteOff == false) {
            uint256 withdrawableAmount = opportunitypool.getUserWithdrawableAmount();
            s_seniorPoolBalance = s_seniorPoolBalance.add(withdrawableAmount);
        } else {
            s_seniorPoolBalance = s_seniorPoolBalance.add(amount);
        }
    }

    function approveUSDC(address user) public onlyAdmin {
        s_usdcToken.approve(user, type(uint256).max);
    }
}
