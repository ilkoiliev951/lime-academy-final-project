import { EVMBridge } from "./../../typechain-types/contracts/EVMBridge";
import { expect,} from "chai";
import { ethers } from "hardhat";
import {BigNumber, TypedDataDomain} from "ethers";
import {BigNumberish} from "@ethersproject/bignumber";
import {BytesLike} from "@ethersproject/bytes";

const hre = require("hardhat")
const HARDHAT_TEST_WALLET_ADDRESS = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
const ETH_IN_WEI: BigNumber = BigNumber.from('1000000000000000000');

require("@nomicfoundation/hardhat-chai-matchers")

describe("EVM Token Bridge", function () {
    let bridgeFactory;
    let bridge: EVMBridge;

    let genericERCFactory;
    let genericERC;

    let wrappedERCFactory;
    let wrappedERC;

    before(async function () {
        await hre.network.provider.send("hardhat_reset")
        bridgeFactory = await ethers.getContractFactory("EVMBridge");
        genericERCFactory = await ethers.getContractFactory("GenericERC20");
        wrappedERCFactory = await ethers.getContractFactory("WrappedERC20");

        // @ts-ignore
        // Deploy
        bridge = await bridgeFactory.deploy();
        genericERC = genericERCFactory.deploy();
        wrappedERC = wrappedERCFactory.deploy();

        // Await
        await bridge.deployed();
    })

    // Create

    it("Should create a new generic token", async function () {
        const transaction = await bridge.createToken('Generic Test Token', 'GTT', 'generic')
        await transaction.wait();

        await expect(transaction).emit(bridge, "NewTokenCreated")

        const deployedBridgeToken = await bridge.tokens("GTT");
        expect(deployedBridgeToken).to.not.be.undefined
        expect(deployedBridgeToken).to.not.be.null
        expect(deployedBridgeToken).to.not.be.equal('0x0000000000000000000000000000000000000000')
    });

    it("Should create a new wrapped token", async function () {
        const transaction = await bridge.createToken('Wrapped Test Token', 'WTT', 'wrapped')
        await transaction.wait();

        await expect(transaction).emit(bridge, "NewTokenCreated")

        const deployedBridgeToken = await bridge.tokens('WTT');
        expect(deployedBridgeToken).to.not.be.undefined
        expect(deployedBridgeToken).to.not.be.null
        expect(deployedBridgeToken).to.not.be.equal('0x0000000000000000000000000000000000000000');
    });

    it("Should revert when caller is not contract owner", async function () {
        const [owner, addr1] = await ethers.getSigners();
        await expect(bridge.connect(addr1).createToken('Generic Test Token', 'GTT', 'generic'))
            .to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should revert when token has already been created on the bridge", async function () {
        await expect(bridge.createToken('Generic Test Token', 'GTT', 'generic'))
            .to.be.revertedWith('Token with the same symbol has already been created on the bridge!')
    });

    it("Should revert when creating token with invalid symbol", async function () {
        await expect(bridge.createToken('Generic Test Token', '', 'generic'))
            .to.be.revertedWithCustomError(bridge, 'InvalidStringInput');
    });

    it("Should revert when creating token with invalid name", async function () {
        await expect(bridge.createToken('', 'GTT1', 'generic'))
            .to.be.revertedWithCustomError(bridge, 'InvalidStringInput');
    });

    // Mint

    it("Should mint token amount and assign to user wallet", async function () {
        const signer = await ethers.getSigners();
        const testUserAddress = signer[0].address
        const wrappedTokenAddress = await bridge.connect(testUserAddress).tokens('WTT');

        const transaction = await bridge.mint(
            "WTT",
            "Wrapped Test Token",
            wrappedTokenAddress,
            testUserAddress,
            ETH_IN_WEI);

        await transaction.wait();
        const userBalanceAfterMint = await bridge.getWERCBalanceOf(wrappedTokenAddress, testUserAddress)

        await expect(transaction).emit(bridge, "TokenAmountMinted")
        expect(userBalanceAfterMint.toString()).to.be.equal('1000000000000000000')
    });

    it("Should revert when trying to mint token that hasn't been created on target", async function () {
        const signer = await ethers.getSigners();
        const testUserAddress = signer[0].address
        const wrappedTokenAddress = await bridge.connect(testUserAddress).tokens('WTT');

        await expect(
            bridge.mint(
                "WFT",
                "'Wrapped Test Token'",
                wrappedTokenAddress,
                testUserAddress,
                0)).to.be.revertedWithCustomError(bridge, 'InvalidAmount');
    });

    it("Should revert when trying to mint with invalid amount", async function () {
        const signer = await ethers.getSigners();
        const testUserAddress = signer[0].address
        const wrappedTokenAddress = await bridge.connect(testUserAddress).tokens('WTT');

        await expect(
            bridge.mint(
            "WTT",
            "'Wrapped Test Token'",
            wrappedTokenAddress,
            testUserAddress,
            0)).to.be.revertedWithCustomError(bridge, 'InvalidAmount');
    });

    it("Should revert when trying to mint with invalid symbol", async function () {
        const signer = await ethers.getSigners();
        const testUserAddress = signer[0].address
        const wrappedTokenAddress = await bridge.connect(testUserAddress).tokens('WTT');

        await expect(
            bridge.mint(
                "",
                "Wrapped Test Token",
                wrappedTokenAddress,
                testUserAddress,
                0)).to.be.revertedWithCustomError(bridge, 'InvalidStringInput');
    });


    it("Should revert when trying to mint with invalid name", async function () {
        const signer = await ethers.getSigners();
        const testUserAddress = signer[0].address
        const wrappedTokenAddress = await bridge.connect(testUserAddress).tokens('WTT');

        await expect(
            bridge.mint(
                "WTT",
                "",
                wrappedTokenAddress,
                testUserAddress,
                0)).to.be.revertedWithCustomError(bridge, 'InvalidStringInput');
    });

    // Lock
    it("Should lock token amount in bridge contract with permit", async function () {
        // Fetch needed addresses
        const signers = await ethers.getSigners();
        const userAddress = await signers[0].getAddress();
        const genericTokenAddress = await bridge.tokens('GTT');
        const testGenericERCContract = await ethers.getContractAt(
            "GenericERC20",
            genericTokenAddress
        );

        // Mint some tokens for the user
        const mintTx = await bridge.mint(
            "GTT",
            "Generic Test Token",
            genericTokenAddress,
            userAddress,
        20000)
        await mintTx.wait()

        // Generate permit data
        const deadline = ethers.constants.MaxUint256;
        const spender = bridge.address;
        const value = 100;

        const [nonce, name, version] = await Promise.all([
            testGenericERCContract.nonces(userAddress),
            testGenericERCContract.name(),
            "1"
        ]);

        const chainId = BigNumber.from(hre.network.config.chainId);

        const { v, r, s } = ethers.utils.splitSignature(
            await signers[0]._signTypedData(
                {
                    name: name,
                    version: version,
                    chainId: chainId,
                    verifyingContract: genericTokenAddress,
                } as TypedDataDomain,
                {
                    Permit: [
                        {
                            name: "owner",
                            type: "address",
                        },
                        {
                            name: "spender",
                            type: "address",
                        },
                        {
                            name: "value",
                            type: "uint256",
                        },
                        {
                            name: "nonce",
                            type: "uint256",
                        },
                        {
                            name: "deadline",
                            type: "uint256",
                        },
                    ],
                },
                {
                    owner: userAddress,
                    spender,
                    value,
                    nonce,
                    deadline,
                }
            )
        );

        console.log('Signed')

        //
    });

    // Lock
    it("Should lock token amount in bridge contract with permit", async function () {
        // Fetch needed addresses
        const signers = await ethers.getSigners();
        const userAddress = await signers[0].getAddress();
        const genericTokenAddress = await bridge.tokens('GTT');
        const testGenericERCContract = await ethers.getContractAt(
            "GenericERC20",
            genericTokenAddress
        );

        // Mint some tokens for the user
        const mintTx = await bridge.mint(
            "GTT",
            "Generic Test Token",
            genericTokenAddress,
            userAddress,
            20000)
        await mintTx.wait()

        // Generate permit data
        const deadline = ethers.constants.MaxUint256;
        const spender = bridge.address;
        const value = 100;

        const [nonce, name, version] = await Promise.all([
            testGenericERCContract.nonces(userAddress),
            testGenericERCContract.name(),
            "1"
        ]);

        const chainId = BigNumber.from(hre.network.config.chainId);

        const { v, r, s } = ethers.utils.splitSignature(
            await signers[0]._signTypedData(
                {
                    name: name,
                    version: version,
                    chainId: chainId,
                    verifyingContract: genericTokenAddress,
                } as TypedDataDomain,
                {
                    Permit: [
                        {
                            name: "owner",
                            type: "address",
                        },
                        {
                            name: "spender",
                            type: "address",
                        },
                        {
                            name: "value",
                            type: "uint256",
                        },
                        {
                            name: "nonce",
                            type: "uint256",
                        },
                        {
                            name: "deadline",
                            type: "uint256",
                        },
                    ],
                },
                {
                    owner: userAddress,
                    spender,
                    value,
                    nonce,
                    deadline,
                }
            )
        );

        console.log('Signed')

        //
    });
});