//SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {DSMath} from "./DSMath.sol";
import {Constants} from "./Constants.sol";
import {SafeMathUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";

library Accounting {
    using SafeMathUpgradeable for uint256;

    uint256 public constant currentDecimals = 6;

    function getTermLoanEMI(uint256 loanAmount, uint256 loanInterest, uint256 emiCount, uint256 paymentFrequency)
        internal
        pure
        returns (uint256)
    {
        require(loanAmount > 0 && loanInterest > 0 && emiCount > 0 && paymentFrequency > 0, "Invalid Input");

        uint256 MonthlyInterest = Constants.oneYearInDays().div(paymentFrequency);

        uint256 InterestForRepayment = DSMath.rdiv(
            DSMath.rdiv(DSMath.getInRay(loanInterest, currentDecimals), (MonthlyInterest * DSMath.RAY)),
            (100 * DSMath.RAY)
        );

        //CALCULATE (1+r)^n/ (1+r)^n-1 for EMI
        uint256 onePlusInterest = DSMath.RAY.add(InterestForRepayment);
        uint256 onePlusInterestPowerN = DSMath.rpow(onePlusInterest, emiCount);

        uint256 loanAmountInRay = DSMath.getInRay(loanAmount, currentDecimals);
        uint256 division = DSMath.rdiv(onePlusInterestPowerN, (onePlusInterestPowerN - DSMath.RAY));

        uint256 emiAmountInRay = DSMath.rmul(DSMath.rmul(loanAmountInRay, InterestForRepayment), division);

        return emiAmountInRay.div(10 ** 21);
    }

    //Loan using standard EMI calculation P x R / t
    function getBulletLoanEMI(uint256 loanAmount, uint256 loanInterest, uint256 paymentFrequencyInDays)
        internal
        pure
        returns (uint256)
    {
        require(loanAmount > 0 && loanInterest > 0 && paymentFrequencyInDays > 0, "Invalid Input");

        //Monthly Interest
        uint256 interestPerMonth = DSMath.rdiv(
            DSMath.rdiv(DSMath.getInRay(loanInterest, currentDecimals), (12 * DSMath.RAY)), (100 * DSMath.RAY)
        );

        //Interest for repayment
        uint256 interestForRepaymentDays = DSMath.rmul(
            interestPerMonth,
            DSMath.rdiv((paymentFrequencyInDays * DSMath.RAY), (Constants.oneMonthInDays() * DSMath.RAY))
        );

        //EMI
        uint256 loanAmountInRay = DSMath.getInRay(loanAmount, currentDecimals);
        uint256 emiAmountInRay = DSMath.rmul(loanAmountInRay, interestForRepaymentDays);
        return emiAmountInRay.div(10 ** 21);
    }

    /**
     *
     * Term Loan Interest Calculation
     */
    function getTermLoanInterest(uint256 outstandingPrinciple, uint256 numberOfDays, uint256 loanInterest)
        internal
        pure
        returns (uint256)
    {
        require(outstandingPrinciple > 0 && numberOfDays > 0 && loanInterest > 0, "Invalid Input");

        //Daily Interest
        uint256 interestPerDay = DSMath.rdiv(
            DSMath.rdiv(DSMath.getInRay(loanInterest, currentDecimals), (Constants.oneYearInDays() * DSMath.RAY)),
            (100 * DSMath.RAY)
        );

        //Interest for repayment
        uint256 totalInterest = DSMath.rmul(interestPerDay, (numberOfDays * DSMath.RAY));
        uint256 outstandingPrincipleInRay = DSMath.getInRay(outstandingPrinciple, currentDecimals);
        uint256 interest = DSMath.rmul(outstandingPrincipleInRay, totalInterest);
        return interest.div(10 ** 21);
    }

    /**
     *
     *
     *
     * Get Yield Percentage
     *
     *
     */
    function getYieldPercentage(
        uint256 reignFees,
        uint256 underwriterFees,
        bool isTermLoan,
        uint256 emiAmount,
        uint256 loanAmount,
        uint256 totalRepayments,
        uint256 loanInterest,
        uint256 leverageRatio,
        uint256 loanTenureInDays
    ) internal pure returns (uint256, uint256) {
        require(
            reignFees > 0 && underwriterFees > 0 && emiAmount > 0 && loanAmount > 0 && totalRepayments > 0
                && loanInterest > 0 && leverageRatio > 0 && loanTenureInDays > 0,
            "Invalid Input"
        );
        uint256 totalInterestInRay;
        uint256 reignFeesInRay = DSMath.getInRay(reignFees, currentDecimals);
        uint256 underwriterFeesInRay = DSMath.getInRay(underwriterFees, currentDecimals);
        if (isTermLoan) {
            uint256 emiAmountInRay = DSMath.getInRay(emiAmount, Accounting.currentDecimals);
            uint256 totalREpaymentsInRay = totalRepayments * DSMath.RAY;
            uint256 loanAmountInRay = DSMath.getInRay(loanAmount, Accounting.currentDecimals);
            uint256 interestInRay = DSMath.sub(DSMath.rmul(emiAmountInRay, totalREpaymentsInRay), loanAmountInRay);
            totalInterestInRay = DSMath.rdiv(interestInRay, loanAmountInRay);
        } else {
            //Get Daily interest
            uint256 interestPerDay = DSMath.rdiv(
                DSMath.rdiv(DSMath.getInRay(loanInterest, currentDecimals), (Constants.oneYearInDays() * DSMath.RAY)),
                (100 * DSMath.RAY)
            );
            //Get Interest for repayment
            totalInterestInRay = DSMath.rmul(interestPerDay, (loanTenureInDays * DSMath.RAY));
        }

        require(totalInterestInRay > 0, "Invalid Interest");
        uint256 _seniorYieldPercentage =
            DSMath.rmul(totalInterestInRay, DSMath.sub(DSMath.sub(DSMath.RAY, reignFeesInRay), underwriterFeesInRay));

        uint256 _juniorYieldPercentage = DSMath.rmul(
            totalInterestInRay,
            DSMath.add(
                DSMath.sub(DSMath.RAY, reignFeesInRay), DSMath.rmul(underwriterFeesInRay, leverageRatio * DSMath.RAY)
            )
        );

        return (_seniorYieldPercentage.div(10 ** 21), _juniorYieldPercentage.div(10 ** 21));
    }

    /**
     *
     *
     *
     * Get Interest Distribution
     *
     *
     */
    function getInterestDistribution(
        uint256 reignFees,
        uint256 underwriterFees,
        uint256 interestAmount,
        uint256 leverageRatio,
        uint256 loanAmount,
        uint256 seniorPoolInvestment
    ) internal pure returns (uint256, uint256) {
        require(
            reignFees > 0 && underwriterFees > 0 && interestAmount > 0 && leverageRatio > 0 && loanAmount > 0
                && seniorPoolInvestment > 0,
            "Invalid Input"
        );
        uint256 reignFeesInRay = DSMath.getInRay(reignFees, currentDecimals);
        uint256 underwriterFeesInRay = DSMath.getInRay(underwriterFees, currentDecimals);
        uint256 interestAmountInRay = DSMath.getInRay(interestAmount, currentDecimals);
        uint256 loanAmountInRay = DSMath.getInRay(loanAmount, currentDecimals);
        uint256 seniorPoolInvestmentInRay = DSMath.getInRay(seniorPoolInvestment, currentDecimals);

        uint256 totalSeniorPoolInterest =
            DSMath.rdiv(DSMath.rmul(interestAmountInRay, seniorPoolInvestmentInRay), loanAmountInRay);

        uint256 underwriterFeesOnInterest = DSMath.rmul(totalSeniorPoolInterest, underwriterFeesInRay);

        uint256 finalSeniorPoolInterest = DSMath.sub(
            DSMath.sub(totalSeniorPoolInterest, DSMath.rmul(totalSeniorPoolInterest, reignFeesInRay)),
            underwriterFeesOnInterest
        );

        uint256 totalJuniorPoolInterest = DSMath.rdiv(
            DSMath.rmul(interestAmountInRay, DSMath.sub(loanAmountInRay, seniorPoolInvestmentInRay)), loanAmountInRay
        );

        uint256 finalJuniorPoolInterest = DSMath.add(
            DSMath.sub(totalJuniorPoolInterest, DSMath.rmul(totalJuniorPoolInterest, reignFeesInRay)),
            underwriterFeesOnInterest
        );

        return (finalSeniorPoolInterest.div(10 ** 21), finalJuniorPoolInterest.div(10 ** 21));
    }
}
