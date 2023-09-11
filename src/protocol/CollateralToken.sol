// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "./ReignConfig.sol";
import {ConfigHelper} from "./ConfigHelper.sol";
import {Constants} from "./Constants.sol";

contract CollateralToken is
    Initializable,
    ERC721Upgradeable,
    ERC721URIStorageUpgradeable,
    PausableUpgradeable,
    AccessControlUpgradeable,
    ERC721BurnableUpgradeable,
    UUPSUpgradeable
{
    using CountersUpgradeable for CountersUpgradeable.Counter;

    ReignConfig public reignConfig;

    using ConfigHelper for ReignConfig;

    CountersUpgradeable.Counter private _tokenIdCounter;

    function initialize(ReignConfig config, address _minterRole) public initializer {
        require(address(config) != address(0), "Invalid config address");

        reignConfig = ReignConfig(config);
        address owner = reignConfig.reignAdminAddress();
        require(owner != address(0), "Invalid Owner");

        __ERC721_init("CollateralToken", "CT");
        __ERC721URIStorage_init();
        __Pausable_init();
        __AccessControl_init();
        __ERC721Burnable_init();
        __UUPSUpgradeable_init();
        _grantRole(DEFAULT_ADMIN_ROLE, owner);
        _grantRole(Constants.pauserRole(), owner);
        _grantRole(Constants.minterRole(), owner);
        _grantRole(Constants.minterRole(), _minterRole);
        _grantRole(Constants.upgraderRole(), owner);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://";
    }

    function pause() public onlyRole(Constants.pauserRole()) {
        _pause();
    }

    function unpause() public onlyRole(Constants.pauserRole()) {
        _unpause();
    }

    function safeMint(address to, string memory uri) public onlyRole(Constants.minterRole()) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal override whenNotPaused {
    //     super._beforeTokenTransfer(from, to, tokenId);
    // }

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(Constants.upgraderRole()) {}

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId) internal override(ERC721Upgradeable, ERC721URIStorageUpgradeable) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721Upgradeable, ERC721URIStorageUpgradeable)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Upgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
