//SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

/**
 * @title IAuthorizeUser
 * @author Deogracious Aggrey
 * @notice This interface defines the functions to authorize and deauthorize users
 */
interface IAuthorizeUser {
    function addToAuthorized(address _user) external;
    function removeFromAuthorized(address _user) external;
    function isAuthorized(address _user) external view returns (bool);
}
