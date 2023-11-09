//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {BaseUpgradeablePausable} from "./BaseUpgradeablePausable.sol";
import {IOpportunityManager} from "../interfaces/IOpportunityManager.sol";
import {ReignConfig} from "./ReignConfig.sol";
import {Constants} from "./Constants.sol";
import {IOpportunityPool} from "../interfaces/IOpportunityPool.sol";
import {ConfigHelper} from "./ConfigHelper.sol";
import {IERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import {ReignCoin} from "./ReignCoin.sol";
import {IReignKeeper} from "../interfaces/IReignKeeper.sol";
import {CollateralToken} from "./CollateralToken.sol";

contract OpportunityManager is BaseUpgradeablePausable, IOpportunityManager {
    ReignConfig public reignConfig;
    ReignCoin public reignCoin;
    CollateralToken public collateralToken;

    using ConfigHelper for ReignConfig;

    mapping(bytes32 => Opportunity) public s_opportunityToId;
    mapping(address => bytes32[]) public s_opportunityOfBorrower;
    mapping(bytes32 => bool) public s_isOpportunity;

    mapping(bytes32 => address[9]) s_underwritersOf;

    mapping(address => bytes32[]) public s_underwriterToOpportunity;
    mapping(bytes32 => uint256) public override writeOffDaysOfLoan;

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
            bytes(_opportunityData.opportunityName).length <= 50,
            "Length of Opportunity name must be less than or equal to 50"
        );
        bytes32 id = keccak256(abi.encodePacked(_opportunityData.collateralDocument));
        require(!s_isOpportunity[id], "Same collateral document has been used to create opprotunity");

        Opportunity memory _opportunity;
        _opportunity.opportunityId = id;
        _opportunity.borrower = _opportunityData.borrower;
        _opportunity.opportunityName = _opportunityData.opportunityName;
        _opportunity.opportunityDescription = _opportunityData.opportunityDescription;
        _opportunity.loanType = _opportunityData.loanType;
        _opportunity.loanAmount = _opportunityData.loanAmount;
        _opportunity.loanTermInDays = _opportunityData.loanTermInDays;
        _opportunity.loanInterest = _opportunityData.loanInterest;
        _opportunity.paymentFrequencyInDays = _opportunityData.paymentFrequencyInDays;
        _opportunity.collateralDocument = _opportunityData.collateralDocument;
        _opportunity.InvestmentLoss = _opportunityData.InvestmentLoss;
        _opportunity.createdAt = block.timestamp;
        writeOffDaysOfLoan[id] = reignConfig.getWriteOffDays();

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
        require(_underwiter != address(0), "Invalid address");
        require(s_isOpportunity[_opportunityId] == true, "Opportunity doesn't exist");
        require(
            s_opportunityToId[_opportunityId].opportunityStatus == OpportunityStatus.UnderReview,
            "Opportunity is already judged"
        );

        s_underwritersOf[_opportunityId][0] = _underwiter;
        s_underwriterToOpportunity[_underwiter].push(_opportunityId);
    }

    function voteOnOpportunity(bytes32 _opportunityId, uint8 _status) external override nonReentrant whenNotPaused {
        require(s_underwritersOf[_opportunityId][0] == msg.sender, "Only assigned underwriter can vote");
        require(s_isOpportunity[_opportunityId] == true, "Opportunity doesn't exist");
        require(
            _status >= uint8(OpportunityStatus.Rejected) && _status <= uint8(OpportunityStatus.Doubtful),
            "Invalid Status"
        );
        require(
            s_opportunityToId[_opportunityId].opportunityStatus == OpportunityStatus.UnderReview,
            "Opportunity is already judged"
        );

        s_opportunityToId[_opportunityId].opportunityStatus = OpportunityStatus(_status);

        if (_status == uint8(OpportunityStatus.Approved)) {
            mintCollateral(_opportunityId);
            createOpportunityPool(_opportunityId);
        }
    }

    function mintCollateral(bytes32 _opportunityId) private {
        require(s_isOpportunity[_opportunityId] == true, "Opportunity doesn't exist");
        require(
            s_opportunityToId[_opportunityId].opportunityStatus == OpportunityStatus.Approved,
            "Opportunity is not approved"
        );

        s_opportunityToId[_opportunityId].opportunityStatus = OpportunityStatus.Collateralized;
        collateralToken.safeMint(msg.sender, s_opportunityToId[_opportunityId].collateralDocument);
    }

    function createOpportunityPool(bytes32 _opportunityId) private returns (address pool) {
        require(
            s_opportunityToId[_opportunityId].opportunityStatus == OpportunityStatus.Collateralized,
            "Opportunity is not collateralized"
        );
        require(s_isOpportunity[_opportunityId] == true, "Opportunity doesn't exist");

        address poolImplAddress = reignConfig.poolImplAddress();
        pool = deployMinimal(poolImplAddress);
        IOpportunityPool(pool).initialize(
            reignConfig,
            s_opportunityToId[_opportunityId].opportunityId,
            s_opportunityToId[_opportunityId].loanAmount,
            s_opportunityToId[_opportunityId].loanTermInDays,
            s_opportunityToId[_opportunityId].loanInterest,
            s_opportunityToId[_opportunityId].paymentFrequencyInDays,
            uint8(s_opportunityToId[_opportunityId].loanType)
        );
        s_opportunityToId[_opportunityId].opportunityPoolAddress = pool;
        s_opportunityToId[_opportunityId].opportunityStatus = OpportunityStatus.Active;

        return pool;
    }

    // https://github.com/OpenZeppelin/openzeppelin-sdk/blob/master/packages/lib/contracts/upgradeability/ProxyFactory.sol
    function deployMinimal(address _logic) internal returns (address proxy) {
        bytes20 targetBytes = bytes20(_logic);
        // solhint-disable-next-line no-inline-assembly
        assembly {
            let clone := mload(0x40)
            mstore(clone, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)
            mstore(add(clone, 0x14), targetBytes)
            mstore(add(clone, 0x28), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)
            proxy := create(0, clone, 0x37)
        }
        return proxy;
    }

    function markDrawnDown(bytes32 _opportunityId) external override {
        require(s_isOpportunity[_opportunityId] == true, "Opportunity doesn't exist");
        require(
            s_opportunityToId[_opportunityId].opportunityStatus == OpportunityStatus.Active, "Opportunity is not active"
        );
        require(msg.sender == s_opportunityToId[_opportunityId].opportunityPoolAddress, "Invalid caller");
        require(s_opportunityToId[_opportunityId].opportunityPoolAddress != address(0), "Invalid pool address");

        s_opportunityToId[_opportunityId].opportunityStatus = OpportunityStatus.DrawnDown;
        IReignKeeper(reignConfig.reignKeeperAddress()).addOpportunityInKeeper(_opportunityId);
    }

    function isDrawndown(bytes32 _opportunityId) external view override returns (bool) {
        require(s_isOpportunity[_opportunityId] == true, "Opportunity doesn't exist");
        return uint8(s_opportunityToId[_opportunityId].opportunityStatus) == uint8(OpportunityStatus.DrawnDown);
    }

    function markRepaid(bytes32 _opportunityId) external override {
        require(s_isOpportunity[_opportunityId] == true, "Opportunity doesn't exist");
        require(
            s_opportunityToId[_opportunityId].opportunityStatus == OpportunityStatus.DrawnDown,
            "Opportunity is not drawn down"
        );
        require(msg.sender == s_opportunityToId[_opportunityId].opportunityPoolAddress, "Invalid caller");
        require(s_opportunityToId[_opportunityId].opportunityPoolAddress != address(0), "Invalid pool address");

        s_opportunityToId[_opportunityId].opportunityStatus = OpportunityStatus.Repaid;
        IReignKeeper(reignConfig.reignKeeperAddress()).removeOpportunityFromKeeper(_opportunityId);
    }

    function isRepaid(bytes32 _opportunityId) external view override returns (bool) {
        require(s_isOpportunity[_opportunityId] == true, "Opportunity doesn't exist");
        return uint8(s_opportunityToId[_opportunityId].opportunityStatus) == uint8(OpportunityStatus.Repaid);
    }

    function isActive(bytes32 _opportunityId) external view override returns (bool) {
        require(s_isOpportunity[_opportunityId] == true, "Opportunity doesn't exist");
        return uint8(s_opportunityToId[_opportunityId].opportunityStatus) == uint8(OpportunityStatus.Active);
    }

    function getBorrower(bytes32 _opportunityId) external view override returns (address) {
        require(s_isOpportunity[_opportunityId] == true, "Opportunity doesn't exist");
        return s_opportunityToId[_opportunityId].borrower;
    }

    function getOpportunityPoolAddress(bytes32 _opportunityId) external view override returns (address) {
        require(s_isOpportunity[_opportunityId] == true, "Opportunity doesn't exist");
        require(
            uint8(s_opportunityToId[_opportunityId].opportunityStatus) >= uint8(OpportunityStatus.Active),
            "Opportunity must be active / drawn down / repaid"
        );
        address poolAddress = s_opportunityToId[_opportunityId].opportunityPoolAddress;
        require(poolAddress != address(0), "Invalid pool address");
        return poolAddress;
    }

    function getAllOpportunitiesOfBorrower(address _borrower) external view override returns (bytes32[] memory) {
        require(address(_borrower) != address(0), "Invalid Address");
        return s_opportunityOfBorrower[_borrower];
    }

    function getUnderwriterOpporunities(address _underwriter) external view override returns (bytes32[] memory) {
        require(address(_underwriter) != address(0), "Invalid Address");
        return s_underwriterToOpportunity[_underwriter];
    }

    function getOpportunityName(bytes32 _opportunityId) external view override returns (string memory) {
        require(s_isOpportunity[_opportunityId] == true, "Opportunity doesn't exist");
        return s_opportunityToId[_opportunityId].opportunityName;
    }

    function markWriteOff(bytes32 _opportunityId, address _pool) external override {
        require(s_isOpportunity[_opportunityId] == true, "Opportunity doesn't exist");
        require(msg.sender == reignConfig.reignKeeperAddress(), "Invalid caller");
        require(
            s_opportunityToId[_opportunityId].opportunityStatus == OpportunityStatus.DrawnDown,
            "Opportunity is not drawn down"
        );

        s_opportunityToId[_opportunityId].opportunityStatus = OpportunityStatus.WriteOff;
        IOpportunityPool(_pool).writeOffOpportunity();
    }

    function isWrittenOff(bytes32 _opportunityId) external view override returns (bool) {
        require(s_isOpportunity[_opportunityId] == true, "Opportunity doesn't exist");
        return uint8(s_opportunityToId[_opportunityId].opportunityStatus) == uint8(OpportunityStatus.WriteOff);
    }
}
