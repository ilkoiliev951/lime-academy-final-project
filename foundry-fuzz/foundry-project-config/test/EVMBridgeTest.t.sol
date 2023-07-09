// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "src/EVMBridge.sol";
import "../src/SigUtils.sol";

contract EVMBridgeTest is Test {
    address public bridgeAddress;
    EVMBridge public bridge;

    uint256 public constant MAX_UINT = 2**256 - 1;
    uint256 public constant OWNER_PK = 0xA11CE;
    address public OWNER = vm.addr(OWNER_PK);

    receive() external payable {}

    function setUp() public {
        vm.startPrank(OWNER);
        bridgeAddress = address(new EVMBridge());
        bridge = EVMBridge(bridgeAddress);
        vm.stopPrank();
    }

    function testFuzzCreateGenericToken(string memory tokenName, string memory tokenSymbol) public {
        vm.startPrank(OWNER);
        vm.assume(bytes(tokenName).length > 0);
        vm.assume(bytes(tokenSymbol).length > 0);

        bridge.createToken(tokenName, tokenSymbol, "generic");
        assertNotEq(bridge.tokens(tokenSymbol), address(0));
        vm.stopPrank();
    }

    function testFuzzCreateWrappedToken(string memory tokenName, string memory tokenSymbol) public {
        vm.startPrank(OWNER);
        vm.assume(bytes(tokenName).length > 0);
        vm.assume(bytes(tokenSymbol).length > 0);

        bridge.createToken(tokenName, tokenSymbol, "wrapped");
        assertNotEq(address(0), bridge.tokens(tokenSymbol));
        vm.stopPrank();
    }

    function testFuzzLock (uint256 value) public {
        vm.assume(value > 0);
        // Create the token
        vm.prank(OWNER);
        bridge.createToken("Generic Test Token", "GTT", "generic");
        address tokenAddress = bridge.tokens("GTT");

        SigUtils sigUtils = new SigUtils(GenericERC20(tokenAddress).DOMAIN_SEPARATOR());

        // Mint some tokens for the user
        vm.prank(bridgeAddress);
        GenericERC20(tokenAddress).mint(OWNER, MAX_UINT);

        // Create and sign a permit
        vm.startPrank(OWNER);

        uint256 nonceValue = GenericERC20(tokenAddress).nonces(OWNER);

        SigUtils.Permit memory permit = SigUtils.Permit({
        owner: OWNER,
        spender: address(bridgeAddress),
        value: value,
        nonce: nonceValue,
        deadline: 1 days
        });

        bytes32 digest = sigUtils.getTypedDataHash(permit);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(OWNER_PK, digest);

        // Lock the amount
        bridge.lock(OWNER, tokenAddress, "GTT", value, permit.deadline, v, r, s);

        // Assert
        uint256 postTxBridgeBalance = GenericERC20(tokenAddress).balanceOf(bridgeAddress);
        assertEq(postTxBridgeBalance, value);
        vm.stopPrank();
    }

    function testFuzzMint (uint256 value) public {
        vm.assume(value > 0);
        // Create the token
        vm.startPrank(OWNER);
        bridge.createToken("Wrapped Test Token", "WTT", "wrapped");
        address tokenAddress = bridge.tokens("WTT");

        // Update bridge balance
        bridge.updateUserBridgeBalance(OWNER, MAX_UINT, 0, "WTT");

        // Mint some tokens for the user
        bridge.mint("WTT", "Wrapped Test Token", tokenAddress, OWNER, value);

        // Assert
        uint256 postTxBridgeBalance = WrappedERC20(tokenAddress).balanceOf(OWNER);
        assertEq(postTxBridgeBalance, value);
        vm.stopPrank();
    }

    function testFuzzBurn (uint256 value) public{
        vm.assume(value > 0);
        // Create the token
        vm.startPrank(OWNER);
        bridge.createToken("Wrapped Test Token", "WTT", "wrapped");
        address tokenAddress = bridge.tokens("WTT");

        bridge.updateUserBridgeBalance(OWNER, value, value, "WTT");

        SigUtils sigUtils = new SigUtils(WrappedERC20(tokenAddress).DOMAIN_SEPARATOR());

        vm.stopPrank();
        // Mint some tokens for the user
        vm.prank(bridgeAddress);
        WrappedERC20(tokenAddress).mint(OWNER, value);

        // Create and sign a permit
        vm.startPrank(OWNER);

        uint256 nonceValue = WrappedERC20(tokenAddress).nonces(OWNER);

        SigUtils.Permit memory permit = SigUtils.Permit({
        owner: OWNER,
        spender: address(bridgeAddress),
        value: value,
        nonce: nonceValue,
        deadline: 1 days
        });

        bytes32 digest = sigUtils.getTypedDataHash(permit);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(OWNER_PK, digest);

        // Lock the amount
        bridge.burnWithPermit( "WTT", tokenAddress, OWNER, value, permit.deadline, v, r, s);

        // Assert
        uint256 postTxUserBalance = WrappedERC20(tokenAddress).balanceOf(OWNER);
        assertEq(postTxUserBalance, 0);
        vm.stopPrank();
    }

    function testFuzzRelease (uint256 value) public{
        vm.assume(value > 0);
        // Create the token
        vm.startPrank(OWNER);
        bridge.createToken("Generic Test Token", "GTT", "generic");
        address tokenAddress = bridge.tokens("GTT");

        // Update bridge balance
        bridge.updateUserBridgeBalance(OWNER, value, value, "GTT");
        vm.stopPrank();

        // Mint token amount to contract
        vm.prank(bridgeAddress);
        GenericERC20(tokenAddress).mint(bridgeAddress, value);

        vm.startPrank(OWNER);
        // Release
        bridge.release(value, tokenAddress, "GTT");

        // Assert
        uint256 postTxUserBalance = GenericERC20(tokenAddress).balanceOf(OWNER);
        assertEq(postTxUserBalance, value);
        vm.stopPrank();
    }
}