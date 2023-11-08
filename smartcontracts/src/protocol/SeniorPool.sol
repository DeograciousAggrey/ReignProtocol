//SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

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
import {ConfigOptions} from "./ConfigOptions.sol";
import {Constants} from "./Constants.sol";
import {ConfigHelper} from "./ConfigHelper.sol";

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

        opportunityManager = IOpportunityManager(reignConfig.getOpportunityOrigination());

        _BaseUpgradeablePausable_init(owner);
        s_usdcToken = IERC20(reignConfig.usdcAddress());
        s_reignToken = IReignCoin(reignConfig.reignCoinAddress());
        s_investmentLockInMonths = reignConfig.getSeniorPoolLockinMonths();
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
        uint256 amount = opportunitypool.getSeniorTotalDepositable();

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
        if (_isWriteOff == true) totalprofit = amount;
        else totalprofit = opportunitypool.getSeniorProfit();
        uint256 _totalShares = s_reignToken.totalShares();
        uint256 delta = totalprofit.mul(lpMantissa()).div(_totalShares);
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

    function getUserInvestment() external view returns (uint256 withdrawableAmount, uint256 stakingAmount) {
        require(s_isStaking[msg.sender] == true, "SeniorPool: user is not staking");

        uint256 stakingAmt;
        uint256 withdrawableAmt;
        uint256 lockInTime = s_investmentLockInMonths * Constants.oneMonth();
        InvestmentTimestamp[] memory investments = s_stakingAmount[msg.sender];

        for (uint256 i = 0; i < investments.length; i++) {
            if (investments[i].timestamp.add(lockInTime) <= block.timestamp) {
                withdrawableAmt = withdrawableAmt.add(investments[i].amount);
            } else {
                stakingAmt = stakingAmt.add(investments[i].amount);
            }
        }

        if (s_availableToWithdraw[msg.sender] > 0) {
            withdrawableAmt = withdrawableAmt.add(s_availableToWithdraw[msg.sender]);
        }

        return (withdrawableAmt, stakingAmt);
    }

    function getDefaultLockInMonths() external view returns (uint256) {
        return s_investmentLockInMonths;
    }

    function getTotalStakingBalance() internal view returns (uint256) {
        require(s_isStaking[msg.sender] == true, "SeniorPool: user is not staking");

        uint256 stakingAmt;
        InvestmentTimestamp[] memory investments = s_stakingAmount[msg.sender];
        for (uint256 i = 0; i < investments.length; i++) {
            stakingAmt = stakingAmt.add(investments[i].amount);
        }
        return stakingAmt;
    }

    function sanitizeInputDecimalDiscrepancies(uint256 inputAmt, uint256 withdrawableAmt)
        internal
        pure
        returns (uint256 amount)
    {
        if (inputAmt > withdrawableAmt && (inputAmt - withdrawableAmt) < lpMantissa()) {
            amount = withdrawableAmt;
        } else {
            amount = inputAmt;
        }
    }

    function withdrawWithLP(uint256 amount) external {
        require(s_isStaking[msg.sender] == true && amount > 0, "SeniorPool: invalid amount or user is not staking");

        //Calculate Amount available for investment
        uint256 stakingAmount;
        uint256 lockInTime = s_investmentLockInMonths * Constants.oneMonth();
        InvestmentTimestamp[] storage investments = s_stakingAmount[msg.sender];

        for (uint256 i; i < investments.length; i++) {
            if (investments[i].timestamp.add(lockInTime) <= block.timestamp) {
                s_availableToWithdraw[msg.sender] = s_availableToWithdraw[msg.sender].add(investments[i].amount);
                delete investments[i];
            } else {
                stakingAmount = stakingAmount.add(investments[i].amount);
            }
        }

        //Sanitize if there is decimal discrepancy with input amount and available amount
        uint256 withdrawableAmt = s_availableToWithdraw[msg.sender];
        amount = sanitizeInputDecimalDiscrepancies(amount, withdrawableAmt);
        require(amount <= withdrawableAmt, "SeniorPool: insufficient withdrawable amount");
        s_availableToWithdraw[msg.sender] = s_availableToWithdraw[msg.sender].sub(amount);

        if (getTotalStakingBalance() == 0 && s_availableToWithdraw[msg.sender] == 0) {
            s_isStaking[msg.sender] = false;
        }

        //Calculate total USDC based on share price
        uint256 usdcAmount = getUSDCAmountFromShares(amount);

        //Update senior pool balance
        s_seniorPoolBalance = s_seniorPoolBalance.sub(usdcAmount);

        //Update share price
        uint256 totalSharesAfterWithdrawal = totalShares().sub(amount);

        //For small misc values when totalSharesAfterWithdrawal is 0 set share price to 0
        if (s_seniorPoolBalance < lpMantissa() || totalSharesAfterWithdrawal == 0) {
            s_sharePrice = 0;
        } else {
            uint256 availableProfit = s_seniorPoolBalance.sub(totalSharesAfterWithdrawal);
            s_sharePrice = availableProfit.mul(lpMantissa()).div(totalSharesAfterWithdrawal);
        }
        //Burn the lp equivalent of the amount
        s_reignToken.burn(msg.sender, amount);

        //Transfer USDC to user
        s_usdcToken.transfer(msg.sender, usdcAmount);

        //Emit event
        emit Unstake(msg.sender, amount);
    }

    function totalShares() internal view returns (uint256) {
        require(address(s_reignToken) != address(0), "SeniorPool: reignToken address cannot be zero address");
        return s_reignToken.totalShares();
    }

    function lpMantissa() internal pure returns (uint256) {
        return uint256(10) ** uint256(6);
    }

    function getUSDCAmountFromShares(uint256 amount) internal view returns (uint256) {
        return amount.add(amount.mul(s_sharePrice).div(lpMantissa()));
    }
}
