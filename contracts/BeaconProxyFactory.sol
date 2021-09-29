// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";

contract BeaconProxyFactory {
    address public immutable beacon;
    event Deployed(address tokenAddress);

    constructor(address implementation_, address upgrader_) {
        UpgradeableBeacon _beacon = new UpgradeableBeacon(implementation_);
        _beacon.transferOwnership(upgrader_);
        beacon = address(_beacon);
    }

    function createProxy(bytes calldata data_) external returns (address) {
        BeaconProxy proxy = new BeaconProxy(
            beacon,
            data_
        );
        emit Deployed(address(proxy));
        return address(proxy);
    }
}
