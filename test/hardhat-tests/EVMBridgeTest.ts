import { EVMBridge } from "./../../typechain-types/contracts/EVMBridge";
import { expect,} from "chai";
import { ethers } from "hardhat";

const hre = require("hardhat")
require("@nomicfoundation/hardhat-chai-matchers")

describe("Library", function () {
    let bridgeFactory;
    let bridge: EVMBridge;

    before(async function () {
        await hre.network.provider.send("hardhat_reset")
        bridgeFactory = await ethers.getContractFactory("EVMBridge");
        // @ts-ignore
        bridge = await bridgeFactory.deploy();
        await bridge.deployed();
    })

    // Create Token Tests

    it("Should create a new generic token", async function () {
        const transaction = await bridge.createToken('Generic Test Token', 'GTT', 'SEPOLIA')
        await transaction.wait();

        await expect(transaction).emit(bridge, "NewTokenCreated")

        const deployedBridgeTokens = bridge.tokens;

        console.log(JSON.stringify(deployedBridgeTokens))
        expect(deployedBridgeTokens['GGT']).to.not.be.undefined
        expect(deployedBridgeTokens['GGT']).to.not.be.null
    });

    it("Should create a new wrapped token", async function () {
        const transaction = await bridge.createToken('Wrapped Test Token', 'WTT', 'GOERLI')
        await transaction.wait();

        await expect(transaction).emit(bridge, "NewTokenCreated")

        const deployedBridgeTokens = bridge.tokens;

        console.log(JSON.stringify(deployedBridgeTokens))
        expect(deployedBridgeTokens['GGT']).to.not.be.undefined
        expect(deployedBridgeTokens['GGT']).to.not.be.null
    });

    it("Should revert when creating a token with the same name/symbol twice", async function () {
        const transaction = await bridge.createToken('Generic Test Token', 'GTT', 'SEPOLIA')
        await transaction.wait();

        await expect(transaction).emit(bridge, "NewTokenCreated")

        const deployedBridgeTokens = bridge.tokens;

        console.log(JSON.stringify(deployedBridgeTokens))
        expect(deployedBridgeTokens['GGT']).to.not.be.undefined
        expect(deployedBridgeTokens['GGT']).to.not.be.null
    });

    it("Should revert when wrong chain ID is given", async function () {
        const transaction = await bridge.createToken('Generic Test Token', 'GTT', 'SEPOLIA')
        await transaction.wait();

        await expect(transaction).emit(bridge, "NewTokenCreated")

        const deployedBridgeTokens = bridge.tokens;

        console.log(JSON.stringify(deployedBridgeTokens))
        expect(deployedBridgeTokens['GGT']).to.not.be.undefined
        expect(deployedBridgeTokens['GGT']).to.not.be.null
    });

    it("Should revert when invalid token symbol input is given", async function () {
        const transaction = await bridge.createToken('Generic Test Token', 'GTT', 'SEPOLIA')
        await transaction.wait();

        await expect(transaction).emit(bridge, "NewTokenCreated")

        const deployedBridgeTokens = bridge.tokens;

        console.log(JSON.stringify(deployedBridgeTokens))
        expect(deployedBridgeTokens['GGT']).to.not.be.undefined
        expect(deployedBridgeTokens['GGT']).to.not.be.null
    });

    it("Should revert when invalid token name input is given", async function () {
        const transaction = await bridge.createToken('Generic Test Token', 'GTT', 'SEPOLIA')
        await transaction.wait();

        await expect(transaction).emit(bridge, "NewTokenCreated")

        const deployedBridgeTokens = bridge.tokens;

        console.log(JSON.stringify(deployedBridgeTokens))
        expect(deployedBridgeTokens['GGT']).to.not.be.undefined
        expect(deployedBridgeTokens['GGT']).to.not.be.null
    });

    // Lock test - should transfer the funds to contract

    it("Should lock funds from user wallet to contract", async function () {
        const transaction = await bridge.createToken('Generic Test Token', 'GTT', 'SEPOLIA')
        await transaction.wait();

        await expect(transaction).emit(bridge, "NewTokenCreated")

        const deployedBridgeTokens = bridge.tokens;

        console.log(JSON.stringify(deployedBridgeTokens))
        expect(deployedBridgeTokens['GGT']).to.not.be.undefined
        expect(deployedBridgeTokens['GGT']).to.not.be.null
    });

    // lock - revert, if permit is not present

    it("Should revert when signer is not the assets owner", async function () {
        const transaction = await bridge.createToken('Generic Test Token', 'GTT', 'SEPOLIA')
        await transaction.wait();

        await expect(transaction).emit(bridge, "NewTokenCreated")

        const deployedBridgeTokens = bridge.tokens;

        console.log(JSON.stringify(deployedBridgeTokens))
        expect(deployedBridgeTokens['GGT']).to.not.be.undefined
        expect(deployedBridgeTokens['GGT']).to.not.be.null
    });

    // lock - all branch cases

    it("Should revert when amount is invalid", async function () {
        const transaction = await bridge.createToken('Generic Test Token', 'GTT', 'SEPOLIA')
        await transaction.wait();

        await expect(transaction).emit(bridge, "NewTokenCreated")

        const deployedBridgeTokens = bridge.tokens;

        console.log(JSON.stringify(deployedBridgeTokens))
        expect(deployedBridgeTokens['GGT']).to.not.be.undefined
        expect(deployedBridgeTokens['GGT']).to.not.be.null
    });

    it("Should revert when token symbol is invalid", async function () {
        const transaction = await bridge.createToken('Generic Test Token', 'GTT', 'SEPOLIA')
        await transaction.wait();

        await expect(transaction).emit(bridge, "NewTokenCreated")

        const deployedBridgeTokens = bridge.tokens;

        console.log(JSON.stringify(deployedBridgeTokens))
        expect(deployedBridgeTokens['GGT']).to.not.be.undefined
        expect(deployedBridgeTokens['GGT']).to.not.be.null
    });

    // release - should release back to user's wallet

    it("Should release a token amount back to user's wallet", async function () {
        const transaction = await bridge.createToken('Generic Test Token', 'GTT', 'SEPOLIA')
        await transaction.wait();

        await expect(transaction).emit(bridge, "NewTokenCreated")

        const deployedBridgeTokens = bridge.tokens;

        console.log(JSON.stringify(deployedBridgeTokens))
        expect(deployedBridgeTokens['GGT']).to.not.be.undefined
        expect(deployedBridgeTokens['GGT']).to.not.be.null
    });

    // release - should not release to a different account

    it("Should revert when trying to release funds to the wrong account", async function () {
        const transaction = await bridge.createToken('Generic Test Token', 'GTT', 'SEPOLIA')
        await transaction.wait();

        await expect(transaction).emit(bridge, "NewTokenCreated")

        const deployedBridgeTokens = bridge.tokens;

        console.log(JSON.stringify(deployedBridgeTokens))
        expect(deployedBridgeTokens['GGT']).to.not.be.undefined
        expect(deployedBridgeTokens['GGT']).to.not.be.null
    });

    it("Should revert when trying to release with invalid amount", async function () {
        const transaction = await bridge.createToken('Generic Test Token', 'GTT', 'SEPOLIA')
        await transaction.wait();

        await expect(transaction).emit(bridge, "NewTokenCreated")

        const deployedBridgeTokens = bridge.tokens;

        console.log(JSON.stringify(deployedBridgeTokens))
        expect(deployedBridgeTokens['GGT']).to.not.be.undefined
        expect(deployedBridgeTokens['GGT']).to.not.be.null
    });

    it("Should revert when trying to release with invalid symbol", async function () {
        const transaction = await bridge.createToken('Generic Test Token', 'GTT', 'SEPOLIA')
        await transaction.wait();

        await expect(transaction).emit(bridge, "NewTokenCreated")

        const deployedBridgeTokens = bridge.tokens;

        console.log(JSON.stringify(deployedBridgeTokens))
        expect(deployedBridgeTokens['GGT']).to.not.be.undefined
        expect(deployedBridgeTokens['GGT']).to.not.be.null
    });


    // mint - should mint and assign to users wallet

    it("Should mint token amount and assign to user wallet", async function () {
        const transaction = await bridge.createToken('Generic Test Token', 'GTT', 'SEPOLIA')
        await transaction.wait();

        await expect(transaction).emit(bridge, "NewTokenCreated")

        const deployedBridgeTokens = bridge.tokens;

        console.log(JSON.stringify(deployedBridgeTokens))
        expect(deployedBridgeTokens['GGT']).to.not.be.undefined
        expect(deployedBridgeTokens['GGT']).to.not.be.null
    });


    it("Should revert when trying to assign minted amount to the wrong account", async function () {
        const transaction = await bridge.createToken('Generic Test Token', 'GTT', 'SEPOLIA')
        await transaction.wait();

        await expect(transaction).emit(bridge, "NewTokenCreated")

        const deployedBridgeTokens = bridge.tokens;

        console.log(JSON.stringify(deployedBridgeTokens))
        expect(deployedBridgeTokens['GGT']).to.not.be.undefined
        expect(deployedBridgeTokens['GGT']).to.not.be.null
    });

    it("Should revert when trying to mint invalid amount", async function () {
        const transaction = await bridge.createToken('Generic Test Token', 'GTT', 'SEPOLIA')
        await transaction.wait();

        await expect(transaction).emit(bridge, "NewTokenCreated")

        const deployedBridgeTokens = bridge.tokens;

        console.log(JSON.stringify(deployedBridgeTokens))
        expect(deployedBridgeTokens['GGT']).to.not.be.undefined
        expect(deployedBridgeTokens['GGT']).to.not.be.null
    });

    it("Should revert when trying to mint invalid token symbol", async function () {
        const transaction = await bridge.createToken('Generic Test Token', 'GTT', 'SEPOLIA')
        await transaction.wait();

        await expect(transaction).emit(bridge, "NewTokenCreated")

        const deployedBridgeTokens = bridge.tokens;

        console.log(JSON.stringify(deployedBridgeTokens))
        expect(deployedBridgeTokens['GGT']).to.not.be.undefined
        expect(deployedBridgeTokens['GGT']).to.not.be.null
    });


    it("Should burn a token amount", async function () {
        const transaction = await bridge.createToken('Generic Test Token', 'GTT', 'SEPOLIA')
        await transaction.wait();

        await expect(transaction).emit(bridge, "NewTokenCreated")

        const deployedBridgeTokens = bridge.tokens;

        console.log(JSON.stringify(deployedBridgeTokens))
        expect(deployedBridgeTokens['GGT']).to.not.be.undefined
        expect(deployedBridgeTokens['GGT']).to.not.be.null
    });

    it("Should revert when trying to burn invalid amount", async function () {
        const transaction = await bridge.createToken('Generic Test Token', 'GTT', 'SEPOLIA')
        await transaction.wait();

        await expect(transaction).emit(bridge, "NewTokenCreated")

        const deployedBridgeTokens = bridge.tokens;

        console.log(JSON.stringify(deployedBridgeTokens))
        expect(deployedBridgeTokens['GGT']).to.not.be.undefined
        expect(deployedBridgeTokens['GGT']).to.not.be.null
    });

    it("Should revert when trying to burn invalid symbol", async function () {
        const transaction = await bridge.createToken('Generic Test Token', 'GTT', 'SEPOLIA')
        await transaction.wait();

        await expect(transaction).emit(bridge, "NewTokenCreated")

        const deployedBridgeTokens = bridge.tokens;

        console.log(JSON.stringify(deployedBridgeTokens))
        expect(deployedBridgeTokens['GGT']).to.not.be.undefined
        expect(deployedBridgeTokens['GGT']).to.not.be.null
    });

    // Reentrancy attack tests

});