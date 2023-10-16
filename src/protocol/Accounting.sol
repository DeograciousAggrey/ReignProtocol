//SPDX-License-Identifier: MIT

pragma solidity 0.8.4;

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
}
