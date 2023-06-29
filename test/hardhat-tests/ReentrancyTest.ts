import { EVMBridge } from "./../../typechain-types/contracts/EVMBridge";
import { expect,} from "chai";
import { ethers } from "hardhat";

const hre = require("hardhat")
require("@nomicfoundation/hardhat-chai-matchers")

describe("EVM Token Bridge", function () {
    let bridgeFactory;
    let bridge: EVMBridge;

    before(async function () {
        await hre.network.provider.send("hardhat_reset")
        bridgeFactory = await ethers.getContractFactory("EVMBridge");
        // @ts-ignore
        bridge = await bridgeFactory.deploy();
        await bridge.deployed();
    })

    it("Should revert when trying reenter mint", async function () {
        const createTx = await bridge.createToken('Wrapped Test Token', 'WTT', 'wrapped')
        await createTx.wait();

        const signer = await ethers.getSigners();
        const testUserAddress = signer[0].address
        const wrappedTokenAddress = await bridge.connect(testUserAddress).tokens('WTT');

        const updateTx = await bridge.updateUserBridgeBalance(testUserAddress, 1000, 0, "WTT");
        await updateTx.wait()

        const testWrappedERCContract = await ethers.getContractAt(
            "WrappedERC20",
            wrappedTokenAddress
        );

        await bridge.mint(
            "WTT",
            "Wrapped Test Token",
            wrappedTokenAddress,
            testUserAddress,
            1000);

        expect(bridge.mint(
            "WTT",
            "Wrapped Test Token",
            wrappedTokenAddress,
            testUserAddress,
            1000)).to.be.revertedWith('sdfdd');
    });
});