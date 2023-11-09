//SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

/**
 * @title IReignCoin
 * @notice This interface defines the functions for the Reign Coin
 */
interface IReignCoin {
    function mint(address _to, uint256 _amount) external;
    function burn(address _from, uint256 _amount) external;
    function totalShares() external view returns (uint256);
    function initialize(address _reignProtocol) external;
}
