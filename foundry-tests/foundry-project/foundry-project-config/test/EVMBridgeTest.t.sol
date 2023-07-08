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
        try bridge.createToken(tokenName, tokenSymbol, "generic") {
            assertTrue(true);
        } catch Error(string memory reason) {
           assertTrue(true);
        } catch {
            // Revert: Any other error should not occur
            assertTrue(false);
        }
    }

//    function testFuzzCreateWrappedToken(string memory tokenName, string memory tokenSymbol) public {
//        vm.expectRevert(InvalidStringInput.selector);
//        bridge.createToken(tokenName, tokenSymbol, "wrapped");
//      //  assertNotEq(address(0), bridge.tokens(tokenSymbol));
//    }
}
