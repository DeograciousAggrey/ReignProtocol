//SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

interface IAuthorizeUser {
    function addToAuthorized(address _user) external;
    function removeFromAuthorized(address _user) external;
    function isAuthorized(address _user) external view returns (bool);
}
