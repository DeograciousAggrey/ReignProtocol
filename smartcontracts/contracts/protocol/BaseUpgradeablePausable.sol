// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "./PauserPausable.sol";
import "./Constants.sol";

/**
 * @title BaseUpgradeablePausable contract
 * @notice This is our Base contract that most other contracts inherit from. It includes many standard
 *  useful abilities like ugpradeability, pausability, access control, and re-entrancy guards.
 * @author Dygnify
 */

contract BaseUpgradeablePausable is
    Initializable,
    AccessControlUpgradeable,
    PauserPausable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable
{
    using SafeMathUpgradeable for uint256;

    function _authorizeUpgrade(address newImplementation) internal override onlyAdmin {}

    function _BaseUpgradeablePausable_init(address owner) public onlyInitializing {
        require(owner != address(0), "Owner cannot be the zero address");
        __AccessControl_init_unchained();
        __Pausable_init_unchained();
        __ReentrancyGuard_init_unchained();

        _setupRole(Constants.getAdminRole(), owner);
        _setupRole(Constants.getPauserRole(), owner);

        _setRoleAdmin(Constants.getPauserRole(), Constants.getAdminRole());
        _setRoleAdmin(Constants.getAdminRole(), Constants.getAdminRole());
    }

    function isAdmin() public view returns (bool) {
        return hasRole(Constants.getAdminRole(), _msgSender());
    }

    modifier onlyAdmin() {
        require(isAdmin(), "Must have admin role to perform this action");
        _;
    }
}
