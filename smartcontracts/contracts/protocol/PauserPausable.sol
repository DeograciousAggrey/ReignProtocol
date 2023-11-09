//SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {Constants} from "./Constants.sol";

contract PauserPausable is AccessControlUpgradeable, PausableUpgradeable {
    modifier onlyPauserRole() {
        require(hasRole(Constants.getPauserRole(), _msgSender()), "PauserPausable: Caller is not a pauser");
        _;
    }

    function __PauserPausable__init() public initializer {
        __Pausable_init_unchained();
    }

    /**
     * @dev To pause all functions guarded by Pause
     *
     * Requirements:
     *
     * - The caller must have the `PAUSER_ROLE`.
     */

    function pause() public onlyPauserRole {
        _pause();
    }

    function unpause() public onlyPauserRole {
        _unpause();
    }
}
