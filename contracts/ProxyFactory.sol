//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.7;
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract ProxyFactory {
    event Deployed(address proxyAddress);

    function createProxy(address logic_, bytes calldata data_) external returns (address) {
        ERC1967Proxy proxy = new ERC1967Proxy(
            logic_,
            data_
        );
        emit Deployed(address(proxy));
        return address(proxy);
    }
}