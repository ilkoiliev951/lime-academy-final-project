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

    // Reentrancy attack tests


});