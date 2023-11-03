//SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

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

    mapping(address => uint256) public s_stakingBalance;
    mapping(address => bool) public override isStaking;

    SubPoolDetails public s_seniorSubpoolDetails;
    SubPoolDetails public s_juniorSubpoolDetails;

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
        _setupRole(Constants.getSeniorPoolRole(, reignConfig.seniorPoolAddress()));
        _setRoleAdmin(Constants.getBorrowerRole(), Constants.getAdminRole());
        _setRoleAdmin(Constants.getPoolLockerRole(), Constants.getAdminRole());
        _setupRole(Constants.getPoolLockerRole(), owner);


        address borrower = opportunityManager.getBorrowerAddress(_opportunityID);
        _setupRole(Constants.getBorrowerRole(), borrower);
        s_opportunityId = _opportunityID;       
        s_loanAmount = _loanAmount;
        s_totalOutstandingPrincipal = _loanAmount;
        s_loanTenureInDays = _loanTenureInDays;
        s_loanInterest = _loanInterest;
        s_paymentFrequencyInDays = _paymentFrequencyInDays;
        s_repaymentCounter = 1;
        s_loanType = _loanType;



        if (reignConfig.getFlag(_opportunityID)== false) {
            // follow 4x leverage ratio
            s_seniorSubpoolDetails.isPoolLocked = true;
            uint256 temp = s_loanAmount.div(reignConfig.getLeverageRatio() + 1);
            s_seniorSubpoolDetails.totalDepositable = temp.mul(reignConfig.getLeverageRatio());

            s_juniorSubpoolDetails.totalDepositable = s_loanAmount - s_seniorSubpoolDetails.totalDepositable;
            
        } else {
            s_juniorSubpoolDetails.isPoolLocked = true;
            s_seniorSubpoolDetails.totalDepositable = s_loanAmount;
        }

        s_totalRepayments = s_loanTenureInDays.div(s_paymentFrequencyInDays);

        if(s_loanType == 1){
            s_emiAmount = Accounting.getTermLoanEMI(s_loanAmount, s_loanInterest, s_totalRepayments, s_paymentFrequencyInDays);


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
        bool success = usdcToken.approve(address(this), 2**256 - 1);
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
        require(_subpoolId <= uint8(Subpool.SeniorSubpool), "Invalid subpool id");
        require(amount > 0, "Amount should be greater than zero");


        if(_subpoolId == uint8(Subpool.SeniorSubpool)) {
            require(s_seniorSubpoolDetails.isPoolLocked == false, "Senior subpool is locked");
            require(hasRole(Constants.getSeniorPoolRole(), msg.sender), "Caller is doesn't have role in senior pool");
            uint256 totalAmountAfterDeposit = amount.add(s_seniorSubpoolDetails.depositedAmount);

            require(totalAmountAfterDeposit <= s_seniorSubpoolDetails.totalDepositable, "Senior subpool deposit limit exceeded");
            s_seniorSubpoolDetails.depositedAmount = s_seniorSubpoolDetails.depositedAmount.add(amount);
           
        } else if(_subpoolId == uint8(Subpool.JuniorSubpool)) {
            require(s_juniorSubpoolDetails.isPoolLocked == false, "Junior subpool is locked");
            uint256 totalAmountAfterDeposit = amount.add(s_juniorSubpoolDetails.depositedAmount);

            require(totalAmountAfterDeposit <= s_juniorSubpoolDetails.totalDepositable, "Junior subpool deposit limit exceeded");
            s_juniorSubpoolDetails.depositedAmount = s_juniorSubpoolDetails.depositedAmount.add(amount);


        s_stakingBalance[msg.sender] = s_stakingBalance[msg.sender].add(amount);
        isStaking[msg.sender] = true;
             
             if(investor.isInvestor(msg.sender, s_opportunityId) == false) {
                investor.addOppoortunity(msg.sender, s_opportunityId);
             }

             if (totalAmountAfterDeposit >= s_juniorSubpoolDetails.totalDepositable) {
                    s_seniorSubpoolDetails.isPoolLocked = false;
             }
        }

        s_poolBalance = s_poolBalance.add(amount);
        usdcToken.safeTransferFrom(msg.sender, address(this), amount);
        emit Deposited(msg.sender, _subpoolId, amount);
    }

    function drawdown() public override nonReentrant whenNotPaused onlyBorrower {
        require(opportunityManager.isDrawdown(s_opportunityId) == false, "Drawdown already done");
        require(s_isDrawdownsPaused == false, "Drawdowns are paused");
        require(s_poolBalance == s_loanAmount, "Pool balance is not equal to loan amount");

        uint256 amount = s_poolBalance;
        s_poolBalance = 0;
        s_seniorSubpoolDetails.depositedAmount = 0;
        s_juniorSubpoolDetails.depositedAmount = 0;
        s_repaymentStartTime = block.timestamp;
        opportunityManager.markDrawdown(s_opportunityId);
        usdcToken.safeTransferFrom(address(this), msg.sender, amount);
    }

    function repayment() public override nonReentrant onlyBorrower {
        require(s_repaymentCounter <= s_totalRepayments, "All repayments are done");
        require(opportunityManager.isDrawdown(s_opportunityId), "Drawdown is not done");

        uint256 currentRepaymentTime = block.timestamp;
        uint26 currentRepaymentDue = nextRepaymentTime();
        uint256 overDueFee;

        if (currentTime > currentRepaymentDue) {
            uint256 overDueSeconds = currentTime.sub(currentRepaymentDue).div(86400);
            overDueFee = overDueSeconds.mul(s_dailyOverdueInterestRate.div(100)).mul(s_emiAmount).div(Constants.sixDecimal());
        }

        //Term loan
        if(s_loanType == 1) {
            uint256 amount = s_emiAmount;
            s_totalRepaidAmount += s_emiAmount;

            //interest from emi

            uint256 interest = Accounting.getTermLoanInterest(s_totalOutstandingPrincipal, s_paymentFrequencyInDays, s_loanInterest);
            uint256 principalReceived = s_emiamount.sub(interest);
            s_totalOutstandingPrincipal = s_totalOutstandingPrincipal.sub(principalReceived.sub(reignConfig.getAdjustmentOffset()));
            
            uint256 juniorPoolPrincipalportion = principalReceived.div(reignConfig.getLeverageRatio().add(1));

            uint256 seniorPoolPrincipalportion = juniorPoolPrincipalportion.mul(reignConfig.getLeverageRatio());


            s_seniorSubpoolDetails.depositedAmount = s_seniorSubpoolDetails.depositedAmount.add(seniorPoolPrincipalportion);

            s_juniorSubpoolDetails.depositedAmount = s_juniorSubpoolDetails.depositedAmount.add(juniorPoolPrincipalportion);



            //Yield Distribution
            uint256 seniorPoolInterest;
            uint256 juniorPoolInterest;
            (seniorPoolInterest, juniorPoolInterest) = Accounting.getInterestDistribution(reignConfig.getReignFee(), reignConfig.getJuniorSubpoolFee(), interest, reignConfig.getLeverageRatio(), s_loanAmount, s_seniorSubpoolDetails.totalDepositable);
            s_seniorSubpoolDetails.yieldGenerated = s_seniorSubpoolDetails.yieldGenerated.add(seniorPoolInterest);
            s_juniorSubpoolDetails.yieldGenerated = s_juniorSubpoolDetails.yieldGenerated.add(juniorPoolInterest);

            //Overdue Amount Distribution
            s_juniorSubpoolDetails.overdueGenerated = s_juniorSubpoolDetails.overdueGenerated.add(s_juniorOverduePercentage.mul(overDueFee).div(Constants.sixDecimal()));
            s_seniorSubpoolDetails.overdueGenerated = s_seniorSubpoolDetails.overdueGenerated.add(s_seniorOverduePercentage.mul(overDueFee).div(Constants.sixDecimal()));
        
            //Sending funds in Rign treasury
            uint256 reignTreasury = interest.mul(reignConfig.getReignFee()).div(Constants.sixDecimal());
            reignTreasury += overDueFee.mul(reignConfig.getReignFee()).div(Constants.sixDecimal());


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
            (seniorPoolInterest, juniorPoolInterest) = Accounting.getInterestDistribution(reignConfig.getReignFee(), reignConfig.getJuniorSubpoolFee(), amount, reignConfig.getLeverageRatio(), s_loanAmount, s_seniorSubpoolDetails.totalDepositable);
            s_seniorSubpoolDetails.yieldGenerated = s_seniorSubpoolDetails.yieldGenerated.add(seniorPoolInterest);
            s_juniorSubpoolDetails.yieldGenerated = s_juniorSubpoolDetails.yieldGenerated.add(juniorPoolInterest);


            //Overdue Amount Distribution
            s_juniorSubpoolDetails.overdueGenerated = s_juniorSubpoolDetails.overdueGenerated.add(s_juniorOverduePercentage.mul(overDueFee).div(Constants.sixDecimal()));
            s_seniorSubpoolDetails.overdueGenerated = s_seniorSubpoolDetails.overdueGenerated.add(s_seniorOverduePercentage.mul(overDueFee).div(Constants.sixDecimal()));

            //Sending funds in Rign treasury
            uint256 reignTreasury = amount.mul(reignConfig.getReignFee()).div(Constants.sixDecimal());
            reignTreasury += (overDueFee.mul(reignConfig.getReignFee()).div(Constants.sixDecimal()));

            if(s_repaymentCounter == s_totalRepayments) {
                amount = amount.add(s_loanAmount);
                s_totalRepaidAmount = s_totalRepaidAmount.add(s_loanAmount);
                s_seniorSubpoolDetails.depositedAmount = s_seniorSubpoolDetails.totalDepositable;
                s_juniorSubpoolDetails.depositedAmount = s_juniorSubpoolDetails.totalDepositable;
            }

            amount = amount.add(overDueFee);
            s_poolBalance = s_poolBalance.add(amount);

            usdcToken.safeTransferFrom(msg.sender, address(this), amount);

            usdcToken.transfer(reignConfig.reignTreasuryAddress(), reignTreasury);

        }

        if (s_repaymentCounter == s_totalRepayments) {
            opportunityManager.markRepaid(s_opportunityId);
            ISeniorPool(reignConfig.seniorPoolAddress())withdrawFromOppoortunity(false, s_opportunityId,0);


            //Autosend all funs to senior pool since all repayments are done
            uint256 seniorAmount = s_seniorSubpoolDetails.depositedAmount.add(s_seniorSubpoolDetails.yieldGenerated);

            if(s_seniorSubpoolDetails.overdueGenerated > 0) {
                seniorAmount = seniorAmount.add(s_seniorSubpoolDetails.overdueGenerated);
                s_seniorSubpoolDetails.overdueGenerated = 0;
            }

            s_seniorSubpoolDetails.depositedAmount = 0;
            s_seniorSubpoolDetails.yieldGenerated = 0;
            s_poolBalance = s_poolBalance.sub(seniorAmount);
            usdcToken.safeTransfer(reignConfig.seniorPoolAddress(), seniorAmount);


        } else {
            s_repaymentCounter = s_repaymentCounter.add(1);
        }
    }

    /**
     * @notice Withdraws all available funds of the user including principal, interest and overdue fees
     * @param _subpoolId Subpool id
     * @return Returns the amount withdrawn
     * @dev Only the investor can withdraw funds
     */
    function withdrawAll(uint8 _subpoolId) external override nonReentrant whenNotPaused returns(uint25) {

        require(_subpoolId <= uint8(Subpool.SeniorSubpool), "Invalid subpool id");
        require(opportunityManager.isRepaid(s_opportunityId), "Opportunity is not repaid");

        uint256 amount;

        if(_subpoolId == uint8(Subpool.SeniorSubpool)) {
            require(s_seniorSubpoolDetails.isPoolLocked == false, "Senior subpool is locked");
            require(hasRole(Constants.getSeniorPoolRole(), msg.sender), "Caller is doesn't have role in senior pool");
            require(s_seniorSubpoolDetails.depositedAmount > 0, "Senior subpool deposited amount is zero");


            amount = s_seniorSubpoolDetails.depositedAmount.add(s_seniorSubpoolDetails.yieldGenerated);

            if(s_seniorSubpoolDetails.overdueGenerated > 0) {
                amount = amount.add(s_seniorSubpoolDetails.overdueGenerated);
                s_seniorSubpoolDetails.overdueGenerated = 0;
            }

            s_seniorSubpoolDetails.depositedAmount = 0;
            s_seniorSubpoolDetails.yieldGenerated = 0;




        } else if(_subpoolId == uint8(Subpool.JuniorSubpool)) {
            require(s_juniorSubpoolDetails.isPoolLocked == false, "Junior subpool is locked");
            require(isStaking[msg.sender] && s_stakingBalance[msg.sender] > 0, "Caller is not staking");
            uint256 offset = reignConfig.getAdjustmentOffset();

            require(s_stakingBalance[msg.sender] <= s_juniorSubpoolDetails.depositedAmount.add(offset), "Staking balance is greater than deposited amount");

            uint256 yieldEarned = s_juniorSubpoolDetails.yieldGenerated.mul(s_stakingBalance[msg.sender]).div(Constants.sixDecimal());
            yieldEarned = yieldEarned.sub(offset);

            require(yieldEarned <= s_juniorSubpoolDetails.yieldGenerated, "Yield earned is greater than total yield generated");

            uint256 userStakingBalance = s_stakingBalance[msg.sender].sub(offset);
            s_juniorSubpoolDetails.depositedAmount = s_juniorSubpoolDetails.depositedAmount.sub(userStakingBalance);
            s_juniorSubpoolDetails.yieldGenerated = s_juniorSubpoolDetails.yieldGenerated.sub(yieldEarned);

            isStaking[msg.sender] = false;
            amount = userStakingBalance.add(yieldEarned);

            if(s_juniorSubpoolDetails.overdueGenerated > 0) {
                uint256 overdueEarned = (s_juniorSubpoolDetails.overdueGenerated.mul(s_stakingBalance[msg.sender])).div(Constants.sixDecimal());
                amount = amount.add(overdueEarned);
                s_juniorSubpoolDetails.overdueGenerated = s_juniorSubpoolDetails.overdueGenerated.sub(overdueEarned);
            }

            investor.removeOppoortunity(msg.sender, s_opportunityId);
            s_stakingBalance[msg.sender] = 0;


    }
    s_poolBalance = s_poolBalance.sub(amount);
    usdcToken.transfer(msg.sender, amount);
    return amount;
    }

    function getUserWithdrawableAmount() external override view returns(uint256) {
        require(isStaking[msg.sender] && s_stakingBalance[msg.sender] > 0, "Caller is not staking");
        uint256 amount = 0;

        if (opportunityManager.isRepaid(s_opportunityId)) {
            uint256 yieldEarned = s_juniorSubpoolDetails.yieldGenerated.mul(s_stakingBalance[msg.sender]).div(Constants.sixDecimal());

            amount = s_stakingBalance[msg.sender].add(yieldEarned);

            if(s_juniorSubpoolDetails.overdueGenerated > 0) {
                uint256 overdueEarned = (s_juniorSubpoolDetails.overdueGenerated.mul(s_stakingBalance[msg.sender])).div(Constants.sixDecimal());
                amount = amount.add(overdueEarned);
            }
        }
        return amount;
    }

    function getRepaymentAmount() external override view returns(uint256) {
        require(s_repaymentCounter <= s_totalRepayments, "All repayments are done");
        require(opportunityManager.isDrawdown(s_opportunityId), "Drawdown is not done");

        uint256 amount;
        if(s_loanType == 1) {
            amount = s_emiAmount;
            uint256 currentTime = block.timestamp;
            uint256 currentRepaymentDue = nextRepaymentTime();
            uint256 overDueFee;

                if (currentTime > currentRepaymentDue) {
                    uint256 overDueSeconds = currentTime.sub(currentRepaymentDue).div(86400);
                    overDueFee = overDueSeconds.mul(s_dailyOverdueInterestRate.div(100)).mul(s_emiAmount).div(Constants.sixDecimal());
                }

            amount = amount.add(overDueFee);     
        } else {
            amount = s_emiAmount;
            uint256 currentTime = block.timestamp;
            uint256 currentRepaymentDue = nextRepaymentTime();
            uint256 overDueFee;

                if (currentTime > currentRepaymentDue) {
                    uint256 overDueSeconds = currentTime.sub(currentRepaymentDue).div(86400);
                    overDueFee = overDueSeconds.mul(s_dailyOverdueInterestRate.div(100)).mul(s_emiAmount).div(Constants.sixDecimal());
                }
            
            amount = amount.add(overDueFee);
                if(s_repaymentCounter == s_totalRepayments) {
                    amount = amount.add(s_loanAmount);
                }
        }
        return amount;
    }


    function getOverDuePercentage() public override view returns(uint256, uint256) {
        uint256 yield = Accounting.getTermLoanInterest(s_totalOutstandingPrincipal, s_paymentFrequencyInDays, s_loanInterest);
        uint256 juniorInvestment = s_loanAmount.div(reignConfig.getLeverageRatio().add(1));
        uint256 seniorInvestment = juniorInvestment.mul(reignConfig.getLeverageRatio());

        uint256 _seniorOverduePercentage = (seniorInvestment.mul(s_seniorYieldPercentage)).div(yield);
        uint256 _juniorOverduePercentage = (juniorInvestment.mul(s_juniorYieldPercentage)).div(yield);

        return (_seniorOverduePercentage, _juniorOverduePercentage);
    }


    function nextRepaymentTime() public override view returns(uint256) {
        require(s_repaymentCounter <= s_totalRepayments, "All repayments are done");
        uint256 nextRepaymentDue = s_repaymentStartTime.add(s_repaymentCounter.mul(s_paymentFrequencyInDays).mul(86400));
        return nextRepaymentDue;
    }

    function getSeniorTotalDepositable() external override view returns(uint256) {
        return s_seniorSubpoolDetails.totalDepositable;
    }

    function getSeniorProfit() external override view returns(uint256) {
        return s_seniorSubpoolDetails.yieldGenerated + s_seniorSubpoolDetails.overdueGenerated;
    }











}
