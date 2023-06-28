import { EVMBridge } from "./../../typechain-types/contracts/EVMBridge";
import { expect,} from "chai";
import { ethers } from "hardhat";
import {BigNumber} from "ethers";

const hre = require("hardhat")
const sigGenerator = require("../../scripts/utils/helpers/permitSignatureGenerator")
const ETH_IN_WEI: BigNumber = BigNumber.from('1000000000000000000');

require("@nomicfoundation/hardhat-chai-matchers")

describe("EVM Token Bridge", function () {
    let bridgeFactory;
    let bridge: EVMBridge;

    before(async function () {
        await hre.network.provider.send("hardhat_reset")
        bridgeFactory = await ethers.getContractFactory("EVMBridge");

        // @ts-ignore
        // Deploy
        bridge = await bridgeFactory.deploy();

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

    it("Should revert when trying to create token with invalid type", async function () {
        await expect(bridge.createToken('Generic Test Token', 'GWT', 'fungible'))
            .to.be.revertedWithCustomError(bridge, 'InvalidTokenType');
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

        const updateTx = await bridge.updateUserBridgeBalance(testUserAddress, ETH_IN_WEI, 0, "WTT");
        await updateTx.wait()

        const testWrappedERCContract = await ethers.getContractAt(
            "WrappedERC20",
            wrappedTokenAddress
        );

        const transaction = await bridge.mint(
            "WTT",
            "Wrapped Test Token",
            wrappedTokenAddress,
            testUserAddress,
            ETH_IN_WEI);

        await transaction.wait();
        const userBalanceAfterMint = await testWrappedERCContract.balanceOf(testUserAddress);

        await expect(transaction).emit(bridge, "TokenAmountMinted")
        expect(userBalanceAfterMint.toString()).to.be.equal('1000000000000000000')
    });

    it("Should revert when trying to exceed max mint amount", async function () {
        const signer = await ethers.getSigners();
        const testUserAddress = signer[0].address
        const wrappedTokenAddress = await bridge.tokens('WTT');

        const updateTx = await bridge.updateUserBridgeBalance(testUserAddress, 10000, 0, "WTT");
        await updateTx.wait()

        await expect(
            bridge.mint(
                "WTT",
                "'Wrapped Test Token'",
                wrappedTokenAddress,
                testUserAddress,
                20000)).to.be.revertedWith('Requested mint amount exceeds locked source amount');
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

    it("Should revert when trying to mint token, that hasn't been created", async function () {
        const signer = await ethers.getSigners();
        const testUserAddress = signer[0].address
        const wrappedTokenAddress = await bridge.connect(testUserAddress).tokens('WTT');

        await expect(
            bridge.mint(
                "WTG",
                "WTG TEST",
                wrappedTokenAddress,
                testUserAddress,
                100)).to.be.revertedWithCustomError(bridge, 'TokenDoesntExist');
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

        await bridge.updateUserBridgeBalance(userAddress,20000 ,0, "GTT");

        // Mint some tokens for the user
        const mintTx = await bridge.mint(
            "GTT",
            "Generic Test Token",
            genericTokenAddress,
            userAddress,
            20000)
        await mintTx.wait()

        const userBalanceBeforeLock = await testGenericERCContract.balanceOf(userAddress)
        // Generate permit data
        const deadline = ethers.constants.MaxUint256;
        const spender = bridge.address;
        const value = 100;

        const [nonce, name, version] = await Promise.all([
            testGenericERCContract.nonces(userAddress),
            testGenericERCContract.name(),
            "1"
        ]);

        const chainId = BigNumber.from(31337);

        const { v, r, s } = await sigGenerator.generateERC20PermitSignature(
            signers[0],
            name,
            version,
            chainId,
            genericTokenAddress,
            userAddress,
            spender,
            nonce,
            deadline,
            value
        )
        const lockTx = await bridge.lock(
            userAddress,
            genericTokenAddress,
            "GTT",
            value,
            deadline,
            v,
            r,
            s);

        await lockTx.wait()

        // Assert that event is emitted
        await expect(lockTx).to.emit(bridge, 'TokenAmountLocked')

        const contractBalanceAfterLock = await testGenericERCContract.balanceOf(bridge.address)
        const userBalanceAfterLock = await testGenericERCContract.balanceOf(userAddress)

        const after = Number(userBalanceAfterLock.toString())
        const before = Number(userBalanceBeforeLock.toString())

        // Assert that funds are received by the contract
        expect(Number(contractBalanceAfterLock.toString())).to.be.equal(100)
        // Assert that funds are sent from user wallet
        expect(before - after).to.be.equal(100)
    });

    it("Should revert when trying to lock more than signed amount", async function () {
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

        const chainId = BigNumber.from(31337);

        const {v,r,s}= await sigGenerator.generateERC20PermitSignature(
            signers[0],
            name,
            version,
            chainId,
            genericTokenAddress,
            userAddress,
            spender,
            nonce,
            deadline,
            value
        )

        await expect(bridge.lock(
            userAddress,
            genericTokenAddress,
            "GTT",
            10000,
            deadline,
            v,
            r,
            s)).to.be.revertedWith('ERC20Permit: invalid signature')
    });

    it("Should revert when trying to lock an invalid amount", async function () {
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
        const value = 0;

        const [nonce, name, version] = await Promise.all([
            testGenericERCContract.nonces(userAddress),
            testGenericERCContract.name(),
            "1"
        ]);

        const chainId = BigNumber.from(31337);

        const {v,r,s}= await sigGenerator.generateERC20PermitSignature(
            signers[0],
            name,
            version,
            chainId,
            genericTokenAddress,
            userAddress,
            spender,
            nonce,
            deadline,
            value
        )

        await expect(bridge.lock(
            userAddress,
            genericTokenAddress,
            "GTT",
            0,
            deadline,
            v,
            r,
            s)).to.be.revertedWithCustomError(bridge, 'InvalidAmount')

    });

    it("Should revert when trying to lock token with invalid symbol", async function () {
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

        const chainId = BigNumber.from(31337);

        const {v,r,s}= await sigGenerator.generateERC20PermitSignature(
            signers[0],
            name,
            version,
            chainId,
            genericTokenAddress,
            userAddress,
            spender,
            nonce,
            deadline,
            value
        )

        await expect(bridge.lock(
            userAddress,
            genericTokenAddress,
            "",
            100,
            deadline,
            v,
            r,
            s)).to.be.revertedWithCustomError(bridge, 'InvalidStringInput')
    });

    // Burn
    it("Should burn token amount with permit", async function () {
        // Fetch needed addresses
        const signers = await ethers.getSigners();
        const userAddress = await signers[9].getAddress();
        const wrappedTokenAddress = await bridge.tokens('WTT');
        const testWrappedERCContract = await ethers.getContractAt(
            "WrappedERC20",
            wrappedTokenAddress
        );

        const updateTx =  await bridge.updateUserBridgeBalance(userAddress,1000 , 0, 'WTT');
        await updateTx.wait()

        // Mint some tokens for the user
        const mintTx = await bridge.connect(signers[9]).mint(
            'WTT',
            "Wrapped Test Token",
            wrappedTokenAddress,
            userAddress,
            1000)

        await mintTx.wait()

        const updateTx1 =  await bridge.updateUserBridgeBalance(userAddress,0,1000, 'WTT');
        await updateTx1.wait()

        // Generate permit data
        const deadline = ethers.constants.MaxUint256;
        const spender = bridge.address;
        const value = 100;

        const [nonce, name, version] = await Promise.all([
            testWrappedERCContract.nonces(userAddress),
            testWrappedERCContract.name(),
            "1"
        ]);

        const chainId = BigNumber.from(31337);

        const { v, r, s } = await sigGenerator.generateERC20PermitSignature(
            signers[9],
            name,
            version,
            chainId,
            wrappedTokenAddress,
            userAddress,
            spender,
            nonce,
            deadline,
            value
        )
        const burnTx = await bridge.connect(signers[9]).burnWithPermit(
            'WTT',
            wrappedTokenAddress,
            userAddress,
            value,
            deadline,
            v,
            r,
            s);

        await burnTx.wait()
        // Assert that event is emitted
        await expect(burnTx).to.emit(bridge, 'TokenAmountBurned')

        const userBalanceAfterBurn = await testWrappedERCContract.balanceOf(userAddress)
        const after = Number(userBalanceAfterBurn.toString())
        // Assert that funds are burnt from user wallet
        expect(after).to.be.equal(900)
    });

    it("Should revert when trying to exceed max burn amount", async function () {
        // Fetch needed addresses
        const signers = await ethers.getSigners();
        const userAddress = await signers[9].getAddress();
        const wrappedTokenAddress = await bridge.tokens('WTT');
        const testWrappedERCContract = await ethers.getContractAt(
            "WrappedERC20",
            wrappedTokenAddress
        );

        const updateTx =  await bridge.updateUserBridgeBalance(userAddress,0, 10000, 'WTT');
        await updateTx.wait()

        // Generate permit data
        const deadline = ethers.constants.MaxUint256;
        const spender = bridge.address;
        const value = 20000;

        const [nonce, name, version] = await Promise.all([
            testWrappedERCContract.nonces(userAddress),
            testWrappedERCContract.name(),
            "1"
        ]);

        const chainId = BigNumber.from(31337);

        const { v, r, s } = await sigGenerator.generateERC20PermitSignature(
            signers[9],
            name,
            version,
            chainId,
            wrappedTokenAddress,
            userAddress,
            spender,
            nonce,
            deadline,
            value
        )

        // Assert that event is emitted
        await expect(bridge.burnWithPermit(
            "WTT",
            wrappedTokenAddress,
            userAddress,
            value,
            deadline,
            v,
            r,
            s)).to.be.revertedWith('Requested burn amount exceeds minted target amount')

    });

    it("Should revert when burning token with invalid symbol", async function () {
        // Fetch needed addresses
        const signers = await ethers.getSigners();
        const userAddress = await signers[1].getAddress();
        const wrappedTokenAddress = await bridge.tokens('WTT');
        const testGenericERCContract = await ethers.getContractAt(
            "WrappedERC20",
            wrappedTokenAddress
        );

        // Mint some tokens for the user
        const mintTx = await bridge.mint(
            "WTT",
            "Wrapped Test Token",
            wrappedTokenAddress,
            userAddress,
            1000)

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

        const chainId = BigNumber.from(31337);

        const { v, r, s } = await sigGenerator.generateERC20PermitSignature(
            signers[1],
            name,
            version,
            chainId,
            wrappedTokenAddress,
            userAddress,
            spender,
            nonce,
            deadline,
            value
        )
        // Assert that event is emitted
        await expect(bridge.burnWithPermit(
            "",
            wrappedTokenAddress,
            userAddress,
            value,
            deadline,
            v,
            r,
            s)).to.be.revertedWithCustomError(bridge, 'InvalidStringInput')
    });

    it("Should revert when burning token with invalid amount", async function () {
        // Fetch needed addresses
        const signers = await ethers.getSigners();
        const userAddress = await signers[1].getAddress();
        const wrappedTokenAddress = await bridge.tokens('WTT');
        const testGenericERCContract = await ethers.getContractAt(
            "WrappedERC20",
            wrappedTokenAddress
        );

        // Mint some tokens for the user
        const mintTx = await bridge.mint(
            "WTT",
            "Wrapped Test Token",
            wrappedTokenAddress,
            userAddress,
            1000)

        await mintTx.wait()

        // Generate permit data
        const deadline = ethers.constants.MaxUint256;
        const spender = bridge.address;
        const value = 0;

        const [nonce, name, version] = await Promise.all([
            testGenericERCContract.nonces(userAddress),
            testGenericERCContract.name(),
            "1"
        ]);

        const chainId = BigNumber.from(31337);

        const { v, r, s } = await sigGenerator.generateERC20PermitSignature(
            signers[1],
            name,
            version,
            chainId,
            wrappedTokenAddress,
            userAddress,
            spender,
            nonce,
            deadline,
            value
        )
        // Assert that event is emitted
        await expect(bridge.burnWithPermit(
            "WTT",
            wrappedTokenAddress,
            userAddress,
            value,
            deadline,
            v,
            r,
            s)).to.be.revertedWithCustomError(bridge, 'InvalidAmount')
    });

    // Release

    it("Should release token amount back to user wallet", async function () {
        // Fetch needed addresses
        const [owner, addr3] = await ethers.getSigners();
        const userAddress = addr3.address
        const genericTokenAddress = await bridge.tokens('GTT');
        const testGenericERCContract = await ethers.getContractAt(
            "GenericERC20",
            genericTokenAddress
        );

        const updateTx1 =  await bridge.updateUserBridgeBalance(userAddress,1000,0, 'GTT');
        await updateTx1.wait()

        const releaseTx = await bridge.connect(addr3).release(
            100,
            genericTokenAddress,
            "GTT"
        );
        await releaseTx.wait()
        await expect(releaseTx).to.emit(bridge, 'TokenAmountReleased')

        const contractBalanceAfterRelease = await testGenericERCContract.balanceOf(bridge.address)
        const userBalanceAfterRelease = await testGenericERCContract.balanceOf(userAddress)

        expect(Number(contractBalanceAfterRelease.toString())).to.be.equal(0)
        expect(Number(userBalanceAfterRelease.toString())).to.be.equal(100)
    });

    it("Should revert when trying to exceed max release amount", async function () {
        // Fetch needed addresses
        const genericTokenAddress = await bridge.tokens('GTT');
        const [owner, addr3] = await ethers.getSigners();
        const userAddress = addr3.address
        const testGenericERCContract = await ethers.getContractAt(
            "GenericERC20",
            genericTokenAddress
        );

        const updateTx1 =  await bridge.updateUserBridgeBalance(userAddress,10000,0, 'GTT');
        await updateTx1.wait()

        await expect(bridge.release(
            30000,
            genericTokenAddress,
            "GTT"
        )).to.be.revertedWith('Requested release amount exceeds burned target amount')
    });

    it("Should revert when trying to release token with invalid symbol", async function () {
        // Fetch needed addresses
        const genericTokenAddress = await bridge.tokens('GTT');

        await expect(bridge.release(
            100,
            genericTokenAddress,
            ""
        )).to.be.revertedWithCustomError(bridge, "InvalidStringInput")
    });

    it("Should revert when trying to release invalid amount", async function () {
        // Fetch needed addresses
        const genericTokenAddress = await bridge.tokens('GTT');

        await expect(bridge.release(
            0,
            genericTokenAddress,
            "GTT"
        )).to.be.revertedWithCustomError(bridge, "InvalidAmount")
    });

    it("Should be able to mint despite of the signer", async function () {
        const [owner, addr7] = await ethers.getSigners();
        const testUserAddress = addr7.address
        const wrappedTokenAddress = await bridge.connect(testUserAddress).tokens('WTT');

        const updateTx1 =  await bridge.updateUserBridgeBalance(testUserAddress, 1000, 0, 'WTT');
        await updateTx1.wait()

        await expect(
            bridge.connect(addr7).mint(
                "WTT",
                "'Wrapped Test Token'",
                wrappedTokenAddress,
                testUserAddress,
                100)).to.emit(bridge, 'TokenAmountMinted')
    });

    // Update user bridge balance

    it("Should revert when trying to update balance from non-owner account", async function () {
        const signers = await ethers.getSigners();
        const userAddress = await signers[7].getAddress();

        await expect(bridge.connect(signers[7]).updateUserBridgeBalance(userAddress, 100, 200, 'GTT'))
            .to.be.revertedWith("Ownable: caller is not the owner");

    });

    it("Should revert when trying to update balance with invalid token symbol", async function () {
        const signers = await ethers.getSigners();
        const userAddress = await signers[7].getAddress();

        await expect(bridge.updateUserBridgeBalance(userAddress, 100, 200, ''))
            .to.be.revertedWithCustomError(bridge, 'InvalidStringInput');
    });
});