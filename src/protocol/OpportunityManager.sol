//SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import {BaseUpgradeablePausable} from "./BaseUpgradeablePausable.sol";
import {IOpportunityManager} from "../interfaces/IOpportunityManager.sol";
import {ReignConfig} from "./ReignConfig.sol";
import {Constants} from "./Constants.sol";
import {IOpportunityPool} from "../interfaces/IOpportunityPool.sol";
import {ConfigHelper} from "./ConfigHelper.sol";
import {IERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import {ReignCoin} from "./ReignCoin.sol";
import {IReignKeeper} from "../interfaces/IReignKeeper.sol";

contract OpportunityManager is BaseUpgradeablePausable, IOpportunityManager {
    ReignConfig public reignConfig;
    ReignCoin public reignCoin;

    using ConfigHelper for ReignConfig;

    mapping(bytes32 => Opportunity) public s_opportunityToId;
    mapping(address => bytes32[]) public s_opportunityOfBorrower;
    mapping(bytes32 => bool) public s_isOpportunity;

    mapping(bytes32 => address[9]) s_underwritersOf;

    mapping(address => bytes32[]) public s_underwriterToOpportunity;
    mapping(bytes32 => uint256) public override s_writeOffDaysOf;

    bytes32[] public s_opportunityIds;

    function initialize(ReignConfig _reignConfig) external initializer {
        require(address(_reignConfig) != address(0), "Invalid Address");
        reignConfig = _reignConfig;
        address owner = reignConfig.reignAdminAddress();
        require(owner != address(0), "Invalid Owner Address");
        reignCoin = ReignCoin(reignConfig.reignCoinAddress());
        _BaseUpgradeablePausable_init(owner);
    }

    function getTotalOpporunities() external view override returns (uint256) {
        return s_opportunityIds.length;
    }

    function getOpportunityOfBorrower(address _borrower) external view override returns (bytes32[] memory) {
        require(address(_borrower) != address(0), "Invalid Address");
        return s_opportunityOfBorrower[_borrower];
    }

    //Create opportunity
    function createOpportunity(CreateOpportunity memory _opportunityData)
        external
        override
        nonReentrant
        whenNotPaused
    {
        require(uint8(_opportunityData.loanType) <= uint8(LoanType.ArmotizedLoan), "Invalid Loan Type");
        require(_opportunityData.loanAmount > 0, "Invalid Loan Amount");
        require(address(_opportunityData.borrower) != address(0), "Invalid Borrower Address");
        require(
            (_opportunityData.loanInterest > 0 && _opportunityData.loanInterest <= (100 * Constants.sixDecimals())),
            "Invalid Loan Interest"
        );
        require(_opportunityData.loanTermInDays > 0, "Invalid Loan Term");
        require(_opportunityData.paymentFrequencyInDays > 0, "Invalid Payment Frequency");
        require(
            bytes(_opportunityData.opportunityName).Length <= 50, "Length of Opportunity Name should be less than 50"
        );
        bytes32 id = keccak256(abi.encodePacked(_opportunityData.collateralDocument));
        require(!s_isOpportunity[id], "SAme collateral document has been used to create opprotunity");

        Opportunity memory _opportunity;
        _opportunity.opportunityId = id;
        _opportunity.borrower = _opportunityData.borrower;
        _opportunity.opportunityName = _opportunityData.opportunityName;
        _opportunity.opportunityDescription = _opportunityData.opportunityDescription;
        _opportunity.loanType = _opportunityData.loanType;
        _opportunity.loanAmount = _opportunityData.loanAmount;
        _opportunity.loanTenureInDays = _opportunityData.loanTermInDays;
        _opportunity.loanInterest = _opportunityData.loanInterest;
        _opportunity.paymentFrequencyInDays = _opportunityData.paymentFrequencyInDays;
        _opportunity.collateralDocument = _opportunityData.collateralDocument;
        _opportunity.capitalLoss = _opportunityData.capitalLoss;
        _opportunity.loanStartTime = block.timestamp;
        s_writeOffDaysOf = reignConfig.getWriteOffDays();

        s_opportunityToId[id] = _opportunity;
        s_opportunityOfBorrower[_opportunityData.borrower].push(id);
        s_opportunityIds.push(id);
        s_isOpportunity[id] = true;
    }

    function assignUnderwriter(bytes32 _opportunityId, address _underwiter)
        external
        override
        onlyAdmin
        nonReentrant
        whenNotPaused
    {
        require(_underwiter != 0, "Invalid address");
        require(s_isOpportunity[_opportunityId] == true, "Opportunity doesn't exist");
        require(
            s_opportunityToId[_opportunityId].opportunityStatus == OpportunityStatus.UnderReview,
            "Opportunity is already judged"
        );

        s_underwritersOf[_opportunityId][0] = _underwiter;
        s_underwriterToOpportunity[_underwiter].push(_opportunityId);
    }
}
