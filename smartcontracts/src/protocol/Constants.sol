//SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

library Constants {
    uint256 public constant ONE_YEAR_IN_DAYS = 365;
    uint256 public constant ONE_MONTH_IN_DAYS = 30;
    uint256 public constant SIX_DECIMALS = 1e6;
    uint256 public constant ONE_DAY = 86400;
    uint256 public constant ONE_MONTH = ONE_DAY * 30;
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant SENIOR_POOL_ROLE = keccak256("SENIOR_POOL_ROLE");
    bytes32 public constant BORROWER_ROLE = keccak256("BORROWER_ROLE");
    bytes32 public constant POOL_LOCKER_ROLE = keccak256("POOL_LOCKER_ROLE");
    bytes32 public constant AUTHORIZE_USER_ROLE = keccak256("AUTHORIZE_USER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant OWNER = keccak256("OWNER");

    function oneYearInDays() internal pure returns (uint256) {
        return ONE_YEAR_IN_DAYS;
    }

    function oneMonthInDays() internal pure returns (uint256) {
        return ONE_MONTH_IN_DAYS;
    }

    function sixDecimals() internal pure returns (uint256) {
        return SIX_DECIMALS;
    }

    function getSeniorPoolRole() internal pure returns (bytes32) {
        return SENIOR_POOL_ROLE;
    }

    function getBorrowerRole() internal pure returns (bytes32) {
        return BORROWER_ROLE;
    }

    function getPoolLockerRole() internal pure returns (bytes32) {
        return POOL_LOCKER_ROLE;
    }

    function getAuthorizeUserRole() internal pure returns (bytes32) {
        return AUTHORIZE_USER_ROLE;
    }

    function getPauserRole() internal pure returns (bytes32) {
        return PAUSER_ROLE;
    }

    function getMinterRole() internal pure returns (bytes32) {
        return MINTER_ROLE;
    }

    function getUpgraderRole() internal pure returns (bytes32) {
        return UPGRADER_ROLE;
    }

    function getOwnerRole() internal pure returns (bytes32) {
        return OWNER;
    }

    function getAdminRole() internal pure returns (bytes32) {
        return ADMIN_ROLE;
    }

    function oneDay() internal pure returns (uint256) {
        return ONE_DAY;
    }

    function oneMonth() internal pure returns (uint256) {
        return ONE_MONTH;
    }
}
