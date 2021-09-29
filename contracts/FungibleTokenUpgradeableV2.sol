//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.7;
import "./FungibleTokenUpgradeable.sol";

contract FungibleTokenUpgradeableV2 is FungibleTokenUpgradeable {
    function version() public pure override returns (string memory) {
        return "v2";
    }
}