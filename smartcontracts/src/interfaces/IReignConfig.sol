//SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

/**
 * @title IReignConfig
 * @author Deogracious Aggrey
 * @notice This interface defines the functions to set and get the config variables
 */
interface IReignConfig {
    function setNumber(uint256 id, uint256 newNumber) external;
    function getNumber(uint256 id) external view returns (uint256);
    function setAddress(uint256 indexAddress, address newAddress) external;
    function getAddress(uint256 indexAddress) external view returns (address);
    function setFlag(bytes32 indexFlag, bool flag) external;
    function getFlag(bytes32 indexFlag) external view returns (bool);
}
