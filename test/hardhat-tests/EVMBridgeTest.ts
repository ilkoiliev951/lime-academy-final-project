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

    before(async function () {
        await hre.network.provider.send("hardhat_reset")
        bridgeFactory = await ethers.getContractFactory("EVMBridge");
        // @ts-ignore
        bridge = await bridgeFactory.deploy();
        await bridge.deployed();
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

    // it("Should lock funds from user wallet to contract", async function () {
    //     // Sign the message
    //     const amount = ethers.utils.parseEther("10");
    //     const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    //
    //     const genericTokenAddress = await
    //
    //     // Generate a permit signature
    //     const permit = await ethers.getContractAt("IERC20Permit", token.address);
    //     const permitData = await permit.interface.encodeFunctionData("permit", [
    //         user.address,
    //         bridge.address,
    //         amount,
    //         deadline,
    //         0,
    //         "0x",
    //     ]);
    //     const permitSignature = await user.signMessage(ethers.utils.arrayify(permitData));
    //     const { v, r, s } = ethers.utils.splitSignature(permitSignature);
    //
    //     // Call the lock function with permit parameters
    //     await expect(yourContract.lock(user.address, token.address, tokenSymbol, chainId, amount, deadline, permitData, v, r, s))
    //         .to.emit(yourContract, "TokenAmountLocked")
    //         .withArgs(user.address, tokenSymbol, token.address, amount, yourContract.address, ethers.BigNumber.from(await ethers.provider.getBlockNumber()));
    //
    //     // Check the balances after the transfer
    //     const userBalance = await token.balanceOf(user.address);
    //     const contractBalance = await token.balanceOf(yourContract.address);
    //     expect(userBalance).to.equal(ethers.utils.parseEther("90")); // 100 - 10
    //     expect(contractBalance).to.equal(amount);
    // });
    //
    // // lock - revert, if permit is not present
    //
    // it("Should revert when signer is not the assets owner", async function () {
    //     const transaction = await bridge.createToken('Generic Test Token', 'GTT', 'SEPOLIA')
    //     await transaction.wait();
    //
    //     await expect(transaction).emit(bridge, "NewTokenCreated")
    //
    //     const deployedBridgeTokens = bridge.tokens;
    //
    //     console.log(JSON.stringify(deployedBridgeTokens))
    //     expect(deployedBridgeTokens['GGT']).to.not.be.undefined
    //     expect(deployedBridgeTokens['GGT']).to.not.be.null
    // });
    //
    // it("Should revert when amount is invalid", async function () {
    //     const transaction = await bridge.createToken('Generic Test Token', 'WTT', 'SEPOLIA')
    //     await transaction.wait();
    //
    //     await expect(transaction).emit(bridge, "NewTokenCreated")
    //
    //     const deployedBridgeTokens = bridge.tokens;
    //
    //     console.log(JSON.stringify(deployedBridgeTokens))
    //     expect(deployedBridgeTokens['GGT']).to.not.be.undefined
    //     expect(deployedBridgeTokens['GGT']).to.not.be.null
    // });
    //
    // it("Should revert when token symbol is invalid", async function () {
    //     const transaction = await bridge.createToken('Generic Test Token', 'GTT', 'SEPOLIA')
    //     await transaction.wait();
    //
    //     await expect(transaction).emit(bridge, "NewTokenCreated")
    //
    //     const deployedBridgeTokens = bridge.tokens;
    //
    //     console.log(JSON.stringify(deployedBridgeTokens))
    //     expect(deployedBridgeTokens['GGT']).to.not.be.undefined
    //     expect(deployedBridgeTokens['GGT']).to.not.be.null
    // });
    //
    // it("Should release a token amount back to user's wallet", async function () {
    //     const transaction = await bridge.createToken('Generic Test Token', 'GTT', 'SEPOLIA')
    //     await transaction.wait();
    //
    //     await expect(transaction).emit(bridge, "NewTokenCreated")
    //
    //     const deployedBridgeTokens = bridge.tokens;
    //
    //     console.log(JSON.stringify(deployedBridgeTokens))
    //     expect(deployedBridgeTokens['GGT']).to.not.be.undefined
    //     expect(deployedBridgeTokens['GGT']).to.not.be.null
    // });
    //
    // // release - should not release to a different account
    //
    // it("Should revert when trying to release funds to the wrong account", async function () {
    //     const transaction = await bridge.createToken('Generic Test Token', 'GTT', 'SEPOLIA')
    //     await transaction.wait();
    //
    //     await expect(transaction).emit(bridge, "NewTokenCreated")
    //
    //     const deployedBridgeTokens = bridge.tokens;
    //
    //     console.log(JSON.stringify(deployedBridgeTokens))
    //     expect(deployedBridgeTokens['GGT']).to.not.be.undefined
    //     expect(deployedBridgeTokens['GGT']).to.not.be.null
    // });
    //
    // it("Should revert when trying to release with invalid amount", async function () {
    //     const transaction = await bridge.createToken('Generic Test Token', 'GTT', 'SEPOLIA')
    //     await transaction.wait();
    //
    //     await expect(transaction).emit(bridge, "NewTokenCreated")
    //
    //     const deployedBridgeTokens = bridge.tokens;
    //
    //     console.log(JSON.stringify(deployedBridgeTokens))
    //     expect(deployedBridgeTokens['GGT']).to.not.be.undefined
    //     expect(deployedBridgeTokens['GGT']).to.not.be.null
    // });
    //
    // it("Should revert when trying to release with invalid symbol", async function () {
    //     const transaction = await bridge.createToken('Generic Test Token', 'GTT', 'SEPOLIA')
    //     await transaction.wait();
    //
    //     await expect(transaction).emit(bridge, "NewTokenCreated")
    //
    //     const deployedBridgeTokens = bridge.tokens;
    //
    //     console.log(JSON.stringify(deployedBridgeTokens))
    //     expect(deployedBridgeTokens['GGT']).to.not.be.undefined
    //     expect(deployedBridgeTokens['GGT']).to.not.be.null
    // });

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

        const userBalanceAfter = await bridge.provider.getBalance(HARDHAT_TEST_WALLET_ADDRESS);
        console.log("Balance after is: " + userBalanceAfter);

        await expect(transaction).emit(bridge, "TokenAmountMinted")
    });

    //
    //
    // it("Should revert when trying to assign minted amount to the wrong account", async function () {
    //     const transaction = await bridge.createToken('Generic Test Token', 'GTT', 'SEPOLIA')
    //     await transaction.wait();
    //
    //     await expect(transaction).emit(bridge, "NewTokenCreated")
    //
    //     const deployedBridgeTokens = bridge.tokens;
    //
    //     console.log(JSON.stringify(deployedBridgeTokens))
    //     expect(deployedBridgeTokens['GGT']).to.not.be.undefined
    //     expect(deployedBridgeTokens['GGT']).to.not.be.null
    // });
    //
    // it("Should revert when trying to mint invalid amount", async function () {
    //     const transaction = await bridge.createToken('Generic Test Token', 'GTT', 'SEPOLIA')
    //     await transaction.wait();
    //
    //     await expect(transaction).emit(bridge, "NewTokenCreated")
    //
    //     const deployedBridgeTokens = bridge.tokens;
    //
    //     console.log(JSON.stringify(deployedBridgeTokens))
    //     expect(deployedBridgeTokens['GGT']).to.not.be.undefined
    //     expect(deployedBridgeTokens['GGT']).to.not.be.null
    // });
    //
    // it("Should revert when trying to mint invalid token symbol", async function () {
    //     const transaction = await bridge.createToken('Generic Test Token', 'GTT', 'SEPOLIA')
    //     await transaction.wait();
    //
    //     await expect(transaction).emit(bridge, "NewTokenCreated")
    //
    //     const deployedBridgeTokens = bridge.tokens;
    //
    //     console.log
    //
    //     it("Should revert when trying to mint invalid token symbol", async function () {
    //         const transaction = await bridge.createToken('Generic Test Token', 'GTT', 'SEPOLIA')
    //         await transaction.wait();
    //
    //         await expect(transaction).emit(bridge, "NewTokenCreated")
    //
    //         const deployedBridgeTokens = bridge.tokens;
    //
    //         console.log(JSON.stringify(deployedBridgeTokens))
    //         expect(deployedBridgeTokens['GGT']).to.not.be.undefined
    //         expect(deployedBridgeTokens['GGT']).to.not.be.null
    //     });
    //
    //
    //     it("Should burn a token amount", async function () {
    //         const transaction = await bridge.createToken('Generic Test Token', 'GTT', 'SEPOLIA')
    //         await transaction.wait();
    //
    //         await expect(transaction).emit(bridge, "NewTokenCreated")
    //
    //         const deployedBridgeTokens = bridge.tokens;
    //
    //         console.log(JSON.stringify(deployedBridgeTokens))
    //         expect(deployedBridgeTokens['GGT']).to.not.be.undefined
    //         expect(deployedBridgeTokens['GGT']).to.not.be.null
    //     });
    //
    //     it("Should revert when trying to burn invalid amount", async function () {
    //         const transaction = await bridge.createToken('Generic Test Token', 'GTT', 'SEPOLIA')
    //         await transaction.wait();
    //
    //         await expect(transaction).emit(bridge, "NewTokenCreated")
    //
    //         const deployedBridgeToken = bridge.tokens('GTT');
    //
    //         console.log(JSON.stringify(deployedBridgeToken))
    //         expect(deployedBridgeToken).to.not.be.undefined
    //         expect(deployedBridgeToken).to.not.be.null
    //     });
    //
    //     it("Should revert when trying to burn invalid symbol", async function () {
    //         const transaction = await bridge.createToken('Generic Test Token', 'GTT', 'SEPOLIA')
    //         await transaction.wait();
    //
    //         await expect(transaction).emit(bridge, "NewTokenCreated")
    //
    //         const deployedBridgeTokens = bridge.tokens;
    //
    //         console.log(JSON.stringify(deployedBridgeTokens))
    //         expect(deployedBridgeTokens['GGT']).to.not.be.undefined
    //         expect(deployedBridgeTokens['GGT']).to.not.be.null
    //     });(JSON.stringify(deployedBridgeTokens))
    //     expect(deployedBridgeTokens['GGT']).to.not.be.undefined
    //     expect(deployedBridgeTokens['GGT']).to.not.be.null
    // });
    //
    //
    // it("Should burn a token amount", async function () {
    //     const transaction = await bridge.createToken('Generic Test Token', 'GTT', 'SEPOLIA')
    //     await transaction.wait();
    //
    //     await expect(transaction).emit(bridge, "NewTokenCreated")
    //
    //     const deployedBridgeTokens = bridge.tokens;
    //
    //     console.log(JSON.stringify(deployedBridgeTokens))
    //     expect(deployedBridgeTokens['GGT']).to.not.be.undefined
    //     expect(deployedBridgeTokens['GGT']).to.not.be.null
    // });
    //
    // it("Should revert when trying to burn invalid amount", async function () {
    //     const transaction = await bridge.createToken('Generic Test Token', 'GTT', 'SEPOLIA')
    //     await transaction.wait();
    //
    //     await expect(transaction).emit(bridge, "NewTokenCreated")
    //
    //     const deployedBridgeTokens = bridge.tokens;
    //
    //     console.log(JSON.stringify(deployedBridgeTokens))
    //     expect(deployedBridgeTokens['GGT']).to.not.be.undefined
    //     expect(deployedBridgeTokens['GGT']).to.not.be.null
    // });
    //
    // it("Should revert when trying to burn invalid symbol", async function () {
    //     const transaction = await bridge.createToken('Generic Test Token', 'GTT', 'SEPOLIA')
    //     await transaction.wait();
    //
    //     await expect(transaction).emit(bridge, "NewTokenCreated")
    //
    //     const deployedBridgeTokens = bridge.tokens;
    //
    //     console.log(JSON.stringify(deployedBridgeTokens))
    //     expect(deployedBridgeTokens['GGT']).to.not.be.undefined
    //     expect(deployedBridgeTokens['GGT']).to.not.be.null
    // });

    // Reentrancy attack tests

});