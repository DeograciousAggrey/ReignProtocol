//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

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
import {ConfigHelper} from "./ConfigHelper.sol";

contract opportunityPool is BaseUpgradeablePausable, IOpportunityPool {
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

    mapping(address => uint256) public s_stakingBalance;
    mapping(address => bool) public override isStaking;

    SubPoolDetails public s_seniorSubPoolDetails;
    SubPoolDetails public s_juniorSubPoolDetails;

    event Deposited(address indexed executor, uint8 indexed subpool, uint256 amount);
    event withdrew(address indexed executor, uint8 indexed subpool, uint256 amount);

    function initialize(
        ReignConfig _reignconfig,
        bytes32 _opportunityID,
        uint256 _loanAmount,
        uint256 _loanTenureInDays,
        uint256 _loanInterest,
        uint256 _paymentFrequencyInDays,
        uint8 _loanType
    ) external override initializer {
        require(address(_reignconfig) != address(0), "Reign config address is zero");
        reignConfig = _reignconfig;
        address owner = reignConfig.reignAdminAddress();
        require(owner != address(0), "Owner address is zero");
        opportunityManager = IOpportunityManager(reignConfig.getOpportunityOrigination());
        investor = IInvestor(reignConfig.investorContractAddress());

        _BaseUpgradeablePausable_init(owner);
        usdcToken = IERC20(reignConfig.usdcAddress());
        reignToken = IReignCoin(reignConfig.reignCoinAddress());
        _setRoleAdmin(Constants.getSeniorPoolRole(), Constants.getAdminRole());
        _setupRole(Constants.getSeniorPoolRole(), reignConfig.seniorPoolAddress());
        _setRoleAdmin(Constants.getBorrowerRole(), Constants.getAdminRole());
        _setRoleAdmin(Constants.getPoolLockerRole(), Constants.getAdminRole());
        _setupRole(Constants.getPoolLockerRole(), owner);

        address borrower = opportunityManager.getBorrower(_opportunityID);
        _setupRole(Constants.getBorrowerRole(), borrower);
        s_opportunityID = _opportunityID;
        s_loanAmount = _loanAmount;
        s_totalOutstandingPrincipal = _loanAmount;
        s_loanTenureInDays = _loanTenureInDays;
        s_loanInterest = _loanInterest;
        s_paymentFrequencyInDays = _paymentFrequencyInDays;
        s_repaymentCounter = 1;
        s_loanType = _loanType;

        if (reignConfig.getFlag(_opportunityID) == false) {
            // follow 4x leverage ratio
            s_seniorSubPoolDetails.isPoolLocked = true;
            uint256 temp = s_loanAmount.div(reignConfig.getLeverageRatio() + 1);
            s_seniorSubPoolDetails.totalDepositable = temp.mul(reignConfig.getLeverageRatio());

            s_juniorSubPoolDetails.totalDepositable = s_loanAmount - s_seniorSubPoolDetails.totalDepositable;
        } else {
            s_juniorSubPoolDetails.isPoolLocked = true;
            s_seniorSubPoolDetails.totalDepositable = s_loanAmount;
        }

        s_totalRepayments = s_loanTenureInDays.div(s_paymentFrequencyInDays);

        if (s_loanType == 1) {
            s_emiAmount =
                Accounting.getTermLoanEMI(s_loanAmount, s_loanInterest, s_totalRepayments, s_paymentFrequencyInDays);
        } else {
            s_emiAmount = Accounting.getBulletLoanEMI(s_loanAmount, s_loanInterest, s_paymentFrequencyInDays);
        }

        s_dailyOverdueInterestRate = reignConfig.getOverDueFee().div(Constants.oneYearInDays());

        (s_seniorYieldPercentage, s_juniorYieldPercentage) = Accounting.getYieldPercentage(
            reignConfig.getReignFee(),
            reignConfig.getJuniorSubpoolFee(),
            s_loanType == 1,
            s_emiAmount,
            s_loanAmount,
            s_totalRepayments,
            s_loanInterest,
            reignConfig.getLeverageRatio(),
            s_loanTenureInDays
        );

        (s_seniorOverduePercentage, s_juniorOverduePercentage) = getOverDuePercentage();
        bool success = usdcToken.approve(address(this), 2 ** 256 - 1);
        require(success, "approve failed");
    }

    ////////////////////////////////////
    ///////   Modifiers    /////////////
    ////////////////////////////////////

    modifier onlyBorrower() {
        require(hasRole(Constants.getBorrowerRole(), msg.sender), "Caller is not borrower");
        _;
    }

    modifier onlyPoolLocker() {
        require(hasRole(Constants.getPoolLockerRole(), msg.sender), "Caller is not pool locker");
        _;
    }

    function deposit(uint8 _subpoolId, uint256 amount) external override nonReentrant {
        require(_subpoolId <= uint8(SubPool.SeniorSubpool), "Invalid subpool id");
        require(amount > 0, "Amount should be greater than zero");

        if (_subpoolId == uint8(SubPool.SeniorSubpool)) {
            require(s_seniorSubPoolDetails.isPoolLocked == false, "Senior subpool is locked");
            require(hasRole(Constants.getSeniorPoolRole(), msg.sender), "Caller is doesn't have role in senior pool");
            uint256 totalAmountAfterDeposit = amount.add(s_seniorSubPoolDetails.depositedAmount);

            require(
                totalAmountAfterDeposit <= s_seniorSubPoolDetails.totalDepositable,
                "Senior subpool deposit limit exceeded"
            );
            s_seniorSubPoolDetails.depositedAmount = s_seniorSubPoolDetails.depositedAmount.add(amount);
        } else if (_subpoolId == uint8(SubPool.JuniorSubpool)) {
            require(s_juniorSubPoolDetails.isPoolLocked == false, "Junior subpool is locked");
            uint256 totalAmountAfterDeposit = amount.add(s_juniorSubPoolDetails.depositedAmount);

            require(
                totalAmountAfterDeposit <= s_juniorSubPoolDetails.totalDepositable,
                "Junior subpool deposit limit exceeded"
            );
            s_juniorSubPoolDetails.depositedAmount = s_juniorSubPoolDetails.depositedAmount.add(amount);

            s_stakingBalance[msg.sender] = s_stakingBalance[msg.sender].add(amount);
            isStaking[msg.sender] = true;

            if (investor.getInvestor(msg.sender, s_opportunityID) == false) {
                investor.addOpportunity(msg.sender, s_opportunityID);
            }

            if (totalAmountAfterDeposit >= s_juniorSubPoolDetails.totalDepositable) {
                s_seniorSubPoolDetails.isPoolLocked = false;
            }
        }

        s_poolBalance = s_poolBalance.add(amount);
        usdcToken.safeTransferFrom(msg.sender, address(this), amount);
        emit Deposited(msg.sender, _subpoolId, amount);
    }

    function drawdown() public override nonReentrant whenNotPaused onlyBorrower {
        require(opportunityManager.isDrawndown(s_opportunityID) == false, "Drawdown already done");
        require(s_isDrawdownsPaused == false, "Drawdowns are paused");
        require(s_poolBalance == s_loanAmount, "Pool balance is not equal to loan amount");

        uint256 amount = s_poolBalance;
        s_poolBalance = 0;
        s_seniorSubPoolDetails.depositedAmount = 0;
        s_juniorSubPoolDetails.depositedAmount = 0;
        s_repaymentStartTime = block.timestamp;
        opportunityManager.markDrawnDown(s_opportunityID);
        usdcToken.safeTransferFrom(address(this), msg.sender, amount);
    }

    function repayment() public override nonReentrant onlyBorrower {
        require(s_repaymentCounter <= s_totalRepayments, "All repayments are done");
        require(opportunityManager.isDrawndown(s_opportunityID), "Drawdown is not done");

        uint256 currentRepaymentTime = block.timestamp;
        uint256 currentRepaymentDue = nextRepaymentTime();
        uint256 overDueFee;

        if (currentRepaymentTime > currentRepaymentDue) {
            uint256 overDueSeconds = currentRepaymentTime.sub(currentRepaymentDue).div(86400);
            overDueFee =
                overDueSeconds.mul(s_dailyOverdueInterestRate.div(100)).mul(s_emiAmount).div(Constants.sixDecimals());
        }

        //Term loan
        if (s_loanType == 1) {
            uint256 amount = s_emiAmount;
            s_totalRepaidAmount += s_emiAmount;

            //interest from emi

            uint256 interest =
                Accounting.getTermLoanInterest(s_totalOutstandingPrincipal, s_paymentFrequencyInDays, s_loanInterest);
            uint256 principalReceived = s_emiAmount.sub(interest);
            s_totalOutstandingPrincipal =
                s_totalOutstandingPrincipal.sub(principalReceived.sub(reignConfig.getAdjustmentOffset()));

            uint256 juniorPoolPrincipalportion = principalReceived.div(reignConfig.getLeverageRatio().add(1));

            uint256 seniorPoolPrincipalportion = juniorPoolPrincipalportion.mul(reignConfig.getLeverageRatio());

            s_seniorSubPoolDetails.depositedAmount =
                s_seniorSubPoolDetails.depositedAmount.add(seniorPoolPrincipalportion);

            s_juniorSubPoolDetails.depositedAmount =
                s_juniorSubPoolDetails.depositedAmount.add(juniorPoolPrincipalportion);

            //Yield Distribution
            uint256 seniorPoolInterest;
            uint256 juniorPoolInterest;
            (seniorPoolInterest, juniorPoolInterest) = Accounting.getInterestDistribution(
                reignConfig.getReignFee(),
                reignConfig.getJuniorSubpoolFee(),
                interest,
                reignConfig.getLeverageRatio(),
                s_loanAmount,
                s_seniorSubPoolDetails.totalDepositable
            );
            s_seniorSubPoolDetails.yieldGenerated = s_seniorSubPoolDetails.yieldGenerated.add(seniorPoolInterest);
            s_juniorSubPoolDetails.yieldGenerated = s_juniorSubPoolDetails.yieldGenerated.add(juniorPoolInterest);

            //Overdue Amount Distribution
            s_juniorSubPoolDetails.overdueGenerated = s_juniorSubPoolDetails.overdueGenerated.add(
                s_juniorOverduePercentage.mul(overDueFee).div(Constants.sixDecimals())
            );
            s_seniorSubPoolDetails.overdueGenerated = s_seniorSubPoolDetails.overdueGenerated.add(
                s_seniorOverduePercentage.mul(overDueFee).div(Constants.sixDecimals())
            );

            //Sending funds in Rign treasury
            uint256 reignTreasury = interest.mul(reignConfig.getReignFee()).div(Constants.sixDecimals());
            reignTreasury += overDueFee.mul(reignConfig.getReignFee()).div(Constants.sixDecimals());

            amount = amount.add(overDueFee);
            s_poolBalance = s_poolBalance.add(reignTreasury);

            usdcToken.safeTransferFrom(msg.sender, address(this), amount);

            usdcToken.transfer(reignConfig.reignTreasuryAddress(), reignTreasury);
        } else {
            uint256 amount = s_emiAmount;
            s_totalRepaidAmount += amount;

            //Yield Distribution
            uint256 seniorPoolInterest;
            uint256 juniorPoolInterest;
            (seniorPoolInterest, juniorPoolInterest) = Accounting.getInterestDistribution(
                reignConfig.getReignFee(),
                reignConfig.getJuniorSubpoolFee(),
                amount,
                reignConfig.getLeverageRatio(),
                s_loanAmount,
                s_seniorSubPoolDetails.totalDepositable
            );
            s_seniorSubPoolDetails.yieldGenerated = s_seniorSubPoolDetails.yieldGenerated.add(seniorPoolInterest);
            s_juniorSubPoolDetails.yieldGenerated = s_juniorSubPoolDetails.yieldGenerated.add(juniorPoolInterest);

            //Overdue Amount Distribution
            s_juniorSubPoolDetails.overdueGenerated = s_juniorSubPoolDetails.overdueGenerated.add(
                s_juniorOverduePercentage.mul(overDueFee).div(Constants.sixDecimals())
            );
            s_seniorSubPoolDetails.overdueGenerated = s_seniorSubPoolDetails.overdueGenerated.add(
                s_seniorOverduePercentage.mul(overDueFee).div(Constants.sixDecimals())
            );

            //Sending funds in Rign treasury
            uint256 reignTreasury = amount.mul(reignConfig.getReignFee()).div(Constants.sixDecimals());
            reignTreasury += (overDueFee.mul(reignConfig.getReignFee()).div(Constants.sixDecimals()));

            if (s_repaymentCounter == s_totalRepayments) {
                amount = amount.add(s_loanAmount);
                s_totalRepaidAmount = s_totalRepaidAmount.add(s_loanAmount);
                s_seniorSubPoolDetails.depositedAmount = s_seniorSubPoolDetails.totalDepositable;
                s_juniorSubPoolDetails.depositedAmount = s_juniorSubPoolDetails.totalDepositable;
            }

            amount = amount.add(overDueFee);
            s_poolBalance = s_poolBalance.add(amount);

            usdcToken.safeTransferFrom(msg.sender, address(this), amount);

            usdcToken.transfer(reignConfig.reignTreasuryAddress(), reignTreasury);
        }

        if (s_repaymentCounter == s_totalRepayments) {
            opportunityManager.markRepaid(s_opportunityID);
            ISeniorPool(reignConfig.seniorPoolAddress()).withdrawFromOpportunity(false, s_opportunityID, 0);

            //Autosend all funs to senior pool since all repayments are done
            uint256 seniorAmount = s_seniorSubPoolDetails.depositedAmount.add(s_seniorSubPoolDetails.yieldGenerated);

            if (s_seniorSubPoolDetails.overdueGenerated > 0) {
                seniorAmount = seniorAmount.add(s_seniorSubPoolDetails.overdueGenerated);
                s_seniorSubPoolDetails.overdueGenerated = 0;
            }

            s_seniorSubPoolDetails.depositedAmount = 0;
            s_seniorSubPoolDetails.yieldGenerated = 0;
            s_poolBalance = s_poolBalance.sub(seniorAmount);
            usdcToken.safeTransfer(reignConfig.seniorPoolAddress(), seniorAmount);
        } else {
            s_repaymentCounter = s_repaymentCounter.add(1);
        }
    }

    /**
     * @notice Withdraws all available funds of the user including principal, interest and overdue fees
     * @param _subpoolId SubPool id
     * @return Returns the amount withdrawn
     * @dev Only the investor can withdraw funds
     */
    function withdrawAll(uint8 _subpoolId) external override nonReentrant whenNotPaused returns (uint256) {
        require(_subpoolId <= uint8(SubPool.SeniorSubpool), "Invalid subpool id");
        require(opportunityManager.isRepaid(s_opportunityID), "Opportunity is not repaid");

        uint256 amount;

        if (_subpoolId == uint8(SubPool.SeniorSubpool)) {
            require(s_seniorSubPoolDetails.isPoolLocked == false, "Senior subpool is locked");
            require(hasRole(Constants.getSeniorPoolRole(), msg.sender), "Caller is doesn't have role in senior pool");
            require(s_seniorSubPoolDetails.depositedAmount > 0, "Senior subpool deposited amount is zero");

            amount = s_seniorSubPoolDetails.depositedAmount.add(s_seniorSubPoolDetails.yieldGenerated);

            if (s_seniorSubPoolDetails.overdueGenerated > 0) {
                amount = amount.add(s_seniorSubPoolDetails.overdueGenerated);
                s_seniorSubPoolDetails.overdueGenerated = 0;
            }

            s_seniorSubPoolDetails.depositedAmount = 0;
            s_seniorSubPoolDetails.yieldGenerated = 0;
        } else if (_subpoolId == uint8(SubPool.JuniorSubpool)) {
            require(s_juniorSubPoolDetails.isPoolLocked == false, "Junior subpool is locked");
            require(isStaking[msg.sender] && s_stakingBalance[msg.sender] > 0, "Caller is not staking");
            uint256 offset = reignConfig.getAdjustmentOffset();

            require(
                s_stakingBalance[msg.sender] <= s_juniorSubPoolDetails.depositedAmount.add(offset),
                "Staking balance is greater than deposited amount"
            );

            uint256 yieldEarned =
                s_juniorSubPoolDetails.yieldGenerated.mul(s_stakingBalance[msg.sender]).div(Constants.sixDecimals());
            yieldEarned = yieldEarned.sub(offset);

            require(
                yieldEarned <= s_juniorSubPoolDetails.yieldGenerated,
                "Yield earned is greater than total yield generated"
            );

            uint256 userStakingBalance = s_stakingBalance[msg.sender].sub(offset);
            s_juniorSubPoolDetails.depositedAmount = s_juniorSubPoolDetails.depositedAmount.sub(userStakingBalance);
            s_juniorSubPoolDetails.yieldGenerated = s_juniorSubPoolDetails.yieldGenerated.sub(yieldEarned);

            isStaking[msg.sender] = false;
            amount = userStakingBalance.add(yieldEarned);

            if (s_juniorSubPoolDetails.overdueGenerated > 0) {
                uint256 overdueEarned = (s_juniorSubPoolDetails.overdueGenerated.mul(s_stakingBalance[msg.sender])).div(
                    Constants.sixDecimals()
                );
                amount = amount.add(overdueEarned);
                s_juniorSubPoolDetails.overdueGenerated = s_juniorSubPoolDetails.overdueGenerated.sub(overdueEarned);
            }

            investor.removeOpportunity(msg.sender, s_opportunityID);
            s_stakingBalance[msg.sender] = 0;
        }
        s_poolBalance = s_poolBalance.sub(amount);
        usdcToken.transfer(msg.sender, amount);
        return amount;
    }

    function getUserWithdrawableAmount() external view override returns (uint256) {
        require(isStaking[msg.sender] && s_stakingBalance[msg.sender] > 0, "Caller is not staking");
        uint256 amount = 0;

        if (opportunityManager.isRepaid(s_opportunityID)) {
            uint256 yieldEarned =
                s_juniorSubPoolDetails.yieldGenerated.mul(s_stakingBalance[msg.sender]).div(Constants.sixDecimals());

            amount = s_stakingBalance[msg.sender].add(yieldEarned);

            if (s_juniorSubPoolDetails.overdueGenerated > 0) {
                uint256 overdueEarned = (s_juniorSubPoolDetails.overdueGenerated.mul(s_stakingBalance[msg.sender])).div(
                    Constants.sixDecimals()
                );
                amount = amount.add(overdueEarned);
            }
        }
        return amount;
    }

    function getRepaymentAmount() external view override returns (uint256) {
        require(s_repaymentCounter <= s_totalRepayments, "All repayments are done");
        require(opportunityManager.isDrawndown(s_opportunityID), "Drawdown is not done");

        uint256 amount;
        if (s_loanType == 1) {
            amount = s_emiAmount;
            uint256 currentTime = block.timestamp;
            uint256 currentRepaymentDue = nextRepaymentTime();
            uint256 overDueFee;

            if (currentTime > currentRepaymentDue) {
                uint256 overDueSeconds = currentTime.sub(currentRepaymentDue).div(86400);
                overDueFee = overDueSeconds.mul(s_dailyOverdueInterestRate.div(100)).mul(s_emiAmount).div(
                    Constants.sixDecimals()
                );
            }

            amount = amount.add(overDueFee);
        } else {
            amount = s_emiAmount;
            uint256 currentTime = block.timestamp;
            uint256 currentRepaymentDue = nextRepaymentTime();
            uint256 overDueFee;

            if (currentTime > currentRepaymentDue) {
                uint256 overDueSeconds = currentTime.sub(currentRepaymentDue).div(86400);
                overDueFee = overDueSeconds.mul(s_dailyOverdueInterestRate.div(100)).mul(s_emiAmount).div(
                    Constants.sixDecimals()
                );
            }

            amount = amount.add(overDueFee);
            if (s_repaymentCounter == s_totalRepayments) {
                amount = amount.add(s_loanAmount);
            }
        }
        return amount;
    }

    function getOverDuePercentage() public view override returns (uint256, uint256) {
        uint256 yield =
            Accounting.getTermLoanInterest(s_totalOutstandingPrincipal, s_paymentFrequencyInDays, s_loanInterest);
        uint256 juniorInvestment = s_loanAmount.div(reignConfig.getLeverageRatio().add(1));
        uint256 seniorInvestment = juniorInvestment.mul(reignConfig.getLeverageRatio());

        uint256 _seniorOverduePercentage = (seniorInvestment.mul(s_seniorYieldPercentage)).div(yield);
        uint256 _juniorOverduePercentage = (juniorInvestment.mul(s_juniorYieldPercentage)).div(yield);

        return (_seniorOverduePercentage, _juniorOverduePercentage);
    }

    function nextRepaymentTime() public view override returns (uint256) {
        require(s_repaymentCounter <= s_totalRepayments, "All repayments are done");
        uint256 nextRepaymentDue = s_repaymentStartTime.add(s_repaymentCounter.mul(s_paymentFrequencyInDays).mul(86400));
        return nextRepaymentDue;
    }

    function getSeniorTotalDepositable() external view override returns (uint256) {
        return s_seniorSubPoolDetails.totalDepositable;
    }

    function getSeniorProfit() external view override returns (uint256) {
        return s_seniorSubPoolDetails.yieldGenerated + s_seniorSubPoolDetails.overdueGenerated;
    }

    function lockPool(uint8 _subpoolId) public onlyPoolLocker {
        require(_subpoolId <= uint8(SubPool.SeniorSubpool), "Invalid subpool id");
        if (_subpoolId == uint8(SubPool.SeniorSubpool)) {
            s_seniorSubPoolDetails.isPoolLocked = true;
        } else if (_subpoolId == uint8(SubPool.JuniorSubpool)) {
            s_juniorSubPoolDetails.isPoolLocked = true;
        }
    }

    function unlockPool(uint8 _subpoolId) public onlyPoolLocker {
        require(_subpoolId <= uint8(SubPool.SeniorSubpool), "Invalid subpool id");
        if (_subpoolId == uint8(SubPool.SeniorSubpool)) {
            s_seniorSubPoolDetails.isPoolLocked = false;
        } else if (_subpoolId == uint8(SubPool.JuniorSubpool)) {
            s_juniorSubPoolDetails.isPoolLocked = false;
        }
    }

    function pauseDrawdown() public onlyAdmin {
        s_isDrawdownsPaused = true;
    }

    function unpauseDrawdown() public onlyAdmin {
        s_isDrawdownsPaused = false;
    }

    function getOpportunityName() external view override returns (string memory) {
        return opportunityManager.getOpportunityName(s_opportunityID);
    }

    function writeOffOpportunity() external override {
        require(opportunityManager.isWrittenOff(s_opportunityID) == true, "Opportunity is not write off");
        require(msg.sender == reignConfig.getOpportunityOrigination(), "Caller is not opportunity Manager");

        uint256 temp = s_loanAmount.div(reignConfig.getLeverageRatio() + 1);
        uint256 tempSenior = temp.mul(reignConfig.getLeverageRatio());
        uint256 estimatedSeniorYield = s_seniorYieldPercentage.mul(tempSenior).div(Constants.sixDecimals());

        uint256 remainingOverdue;
        if (s_loanType == 1) {
            uint256 currentTime = block.timestamp;
            uint256 currentRepaymentDue = nextRepaymentTime();
            uint256 overDueFee;

            if (currentTime > currentRepaymentDue) {
                uint256 overDueSeconds = currentTime.sub(currentRepaymentDue).div(86400);
                overDueFee = overDueSeconds.mul(s_dailyOverdueInterestRate.div(100)).mul(s_emiAmount).div(
                    Constants.sixDecimals()
                );
            }

            remainingOverdue = overDueFee;
        } else {
            uint256 amount = s_emiAmount;
            uint256 currentTime = block.timestamp;
            uint256 currentRepaymentDue = nextRepaymentTime();
            uint256 overDueFee;

            if (currentTime > currentRepaymentDue) {
                uint256 overDueSeconds = currentTime.sub(currentRepaymentDue).div(86400);
                overDueFee =
                    overDueSeconds.mul(s_dailyOverdueInterestRate.div(100)).mul(amount).div(Constants.sixDecimals());
            }
            remainingOverdue = overDueFee;
        }

        remainingOverdue = s_seniorOverduePercentage.mul(remainingOverdue).div(Constants.sixDecimals());
        uint256 estimateOverDue = remainingOverdue.add(s_seniorSubPoolDetails.overdueGenerated);

        uint256 estimatedSeniorPoolAmount =
            estimateOverDue + estimatedSeniorYield + s_seniorSubPoolDetails.totalDepositable;

        if (s_poolBalance > estimatedSeniorPoolAmount) {
            ISeniorPool(reignConfig.seniorPoolAddress()).withdrawFromOpportunity(
                true, s_opportunityID, estimatedSeniorPoolAmount
            );

            s_seniorSubPoolDetails.depositedAmount = 0;
            s_seniorSubPoolDetails.yieldGenerated = 0;
            s_seniorSubPoolDetails.overdueGenerated = 0;
        } else {
            ISeniorPool(reignConfig.seniorPoolAddress()).withdrawFromOpportunity(true, s_opportunityID, s_poolBalance);

            s_seniorSubPoolDetails.depositedAmount = 0;
            s_seniorSubPoolDetails.yieldGenerated = 0;
            s_seniorSubPoolDetails.overdueGenerated = 0;
        }
    }

    function getSeniorPoolWithdrawableAmount() external view override returns (uint256 amount) {
        require(s_seniorSubPoolDetails.isPoolLocked == false, "Senior subpool is locked");

        amount = s_seniorSubPoolDetails.depositedAmount.add(s_seniorSubPoolDetails.yieldGenerated);

        amount = amount.add(s_seniorSubPoolDetails.overdueGenerated);

        return amount;
    }
}
