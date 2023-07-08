// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./EVMBridge.sol";

/**
Purpose of the contract is testing for reentrancy vulnerability.
This acts only as a proof, that due to the design of ERC20 tokens,
recursive calls are not possible with this approach.
*/
contract ReentrancyAttack {
    EVMBridge public bridge;
    address public exploitTokenAddress;

    constructor(address _bridgeAddress) {
        bridge = EVMBridge(_bridgeAddress);
    }

    receive() external payable {
        bridge.release(100, exploitTokenAddress, "GTT");
    }

    fallback () external payable {
        bridge.release(100, exploitTokenAddress, "GTT");
    }

    function attack() external payable {
        bridge.release(100, exploitTokenAddress, "GTT");
    }

    function updateTokenAddress (address tokenAddress) public {
        exploitTokenAddress = tokenAddress;
    }
}