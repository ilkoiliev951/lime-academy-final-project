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

    function testFuzzCreateGenericToken(string memory tokenName, string memory tokenSymbol) public {
        vm.assume(bytes(tokenName).length > 0);
        vm.assume(bytes(tokenSymbol).length > 0);

        bridge.createToken(tokenName, tokenSymbol, "generic");
        assertNotEq(bridge.tokens(tokenSymbol), address(0));
    }

    function testFuzzCreateWrappedToken(string memory tokenName, string memory tokenSymbol) public {
        vm.assume(bytes(tokenName).length > 0);
        vm.assume(bytes(tokenSymbol).length > 0);

        bridge.createToken(tokenName, tokenSymbol, "wrapped");
        assertNotEq(address(0), bridge.tokens(tokenSymbol));
    }

    function testFuzzLock () public {

    }
//
//    function testFuzzMint () {
//
//
//    }
//
//    function testFuzzBurn () {
//
//    }
//
//    function testFuzzRelease () {
//
//    }
}
