import { EVMBridge } from "./../../typechain-types/contracts/EVMBridge";
import { expect,} from "chai";
import { ethers } from "hardhat";
import {PromiseOrValue} from "../../typechain-types/common";
import {BigNumberish} from "ethers";

const hre = require("hardhat")
const HARDHAT_TEST_WALLET_ADDRESS = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const ETH_IN_WEI = "1000000000000000000";

require("@nomicfoundation/hardhat-chai-matchers")

describe("Library", function () {
    let bridgeFactory;
    let bridge: EVMBridge;

    let genericERC20Factory;
    let genericERC20;

    let wrappedERC20Factory;
    let wrappedERC20;

    before(async function () {
        await hre.network.provider.send("hardhat_reset")
        bridgeFactory = await ethers.getContractFactory("EVMBridge");
        genericERC20Factory = await ethers.getContractFactory("GenericERC20");
        wrappedERC20Factory = await ethers.getContractFactory("WrappedERC20");

        // @ts-ignore
        // Deploy
        bridge = await bridgeFactory.deploy();
        genericERC20 = await genericERC20Factory.deploy();
        wrappedERC20 = await wrappedERC20Factory.deploy();

        // Await
        await bridge.deployed();
        await genericERC20.deployed();
        await wrappedERC20.deployed();
    })

    it("Should create a new generic token", async function () {
        const transaction = await bridge.createToken('Generic Test Token', 'GTT', 'SEPOLIA')
        await transaction.wait();

        await expect(transaction).emit(bridge, "NewTokenCreated")

        const deployedBridgeToken = await bridge.tokens("GTT");
        expect(deployedBridgeToken).to.not.be.undefined
        expect(deployedBridgeToken).to.not.be.null
        expect(deployedBridgeToken).to.not.be.equal('0x0000000000000000000000000000000000000000')
    });

    it("Should create a new wrapped token", async function () {
        const transaction = await bridge.createToken('Wrapped Test Token', 'WTT', 'GOERLI')
        await transaction.wait();

        await expect(transaction).emit(bridge, "NewTokenCreated")

        const deployedBridgeToken = await bridge.tokens('WTT');
        expect(deployedBridgeToken).to.not.be.undefined
        expect(deployedBridgeToken).to.not.be.null
        expect(deployedBridgeToken).to.not.be.equal('0x0000000000000000000000000000000000000000');
    });

    it("Should revert when creating a token with the same symbol twice", async function () {
        await expect(bridge.createToken('Generic Test Token', 'GTT', 'SEPOLIA'))
            .to.be.revertedWithCustomError(bridge, 'TokenAlreadyCreated');
    });

    it("Should revert when creating a token with the same symbol twice", async function () {
        await expect(bridge.createToken('Generic Test Token 2', 'GTT2', 'BINANCE'))
            .to.be.revertedWithCustomError(bridge, 'InvalidChainId');
    });

    it("Should mint token amount and assign to user wallet", async function () {
        const amount = ethers.utils.parseEther("10");
        console.log('Ethers amount: ' + amount)

        const userBalanceBef = await bridge.provider.getBalance(HARDHAT_TEST_WALLET_ADDRESS);
        console.log("Balance bef is: " + userBalanceBef);

        const transaction = await bridge.mint(
            "WTT",
            "'Wrapped Test Token'",
            HARDHAT_TEST_WALLET_ADDRESS,
            amount,
            'GOERLI')

        await transaction.wait();

        const userBalanceAfter = await
        console.log("Balance after is: " + userBalanceAfter);

        await expect(transaction).emit(bridge, "TokenAmountMinted")
    });

    // Reentrancy attack tests

});