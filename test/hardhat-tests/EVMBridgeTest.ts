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

    // Create Token test - should create token

    it("Should create a new token", async function () {
        // const transaction = await bridge
        // await transaction.wait();
        //
        // await expect(transaction).emit(library, "BookAdded")
        //
        // const firstBookKey = await library.bookKey(0)
        // const firstBookElement = await library.books(firstBookKey)
        //
        // expect(firstBookKey).to.not.be.null
        // expect(firstBookElement).to.not.be.null
        // expect(firstBookElement["bookId"]).to.equal(firstBookKey);
        // expect(firstBookElement["name"]).to.equal("Test Title");
        // expect(firstBookElement["author"]).to.equal("Test Author");
        // expect(firstBookElement["availableCopiesCount"]).to.equal(3);
    });

    //  Create Token test - should revert, if trying to create existing token

    // Lock test - should transfer the funds to contract

    // lock - revert, if permit is not present

    // lock - revert, if permit is not present

    // lock - all branch cases

    // release - should release back to user's wallet

    // release - should not release to a different account

    // release - should not release to a different account

    // mint - should mint and assign to users wallet

    // mint - all brach cases

    // burn - should burn the tokens

    // burn - all branch cases

    // reentrancy test

});