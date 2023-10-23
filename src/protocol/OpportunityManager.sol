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

contract OpportunityManager is BaseUpgradeablePausable, IOpportunityManager {}
