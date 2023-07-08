// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "src/EVMBridge.sol";

contract EVMBridgeTest is Test {
    EVMBridge public bridge;

    receive() external payable {}

    function setUp() public {
        bridge = new EVMBridge();
    }

    function testFuzzCreateToken(string tokenName, string tokenSymbol) {

    }


}
