import {BigNumber, ethers, Wallet} from 'ethers';
import secrets from '../../../secrets.json';
import {MissingPrivateKeyException} from "../../utils/exceptions/MissingPrivateKeyException";

const config = require('./../../../config.json')
const constants = require('./../utils/constants')
const bridge = require("./../../../artifacts/contracts/EVMBridge.sol/EVMBridge.json");
const genericERC20 = require("../../../artifacts/contracts/GenericERC20.sol/GenericERC20.json");
const signatureGenerator = require('./../../utils/permitSignatureGenerator')
const repository = require('./../data/repository')
const contractAddress = config.PROJECT_SETTINGS.BRIDGE_CONTRACT_SOURCE;
const provider = getProvider();

export async function createToken(
    privateKey: string,
    tokenName: string,
    tokenSymbol: string) {
    const wallet = getWallet(privateKey);
    const bridgeContract = getBridgeContract(wallet);

    // DB checks
    const createTokenTx = await bridgeContract.createToken(tokenName, tokenSymbol, 'generic');
    await createTokenTx.wait()
    printTransactionOutput(createTokenTx)
}

export async function lockWithPermit(
    tokenSymbol: string,
    tokenAddress: string,
    amount: BigNumber,
    privateKey: string) {

    //   // calculate fee
    //     // calculate gas
    //     // list to user

    // DB checks
    const wallet = getWallet(privateKey);
    const userAddressPub = wallet.getAddress();
    const bridgeContract = getBridgeContract(wallet);
    const erc20Contract = getGenericERC20Contract(wallet, tokenAddress);

    const {v,r,s} = signatureGenerator.generateERC20PermitSignature(
        wallet,
        erc20Contract.name(),
        constants.SOURCE_CHAIN_ID,
        tokenAddress,
        userAddressPub,
        bridgeContract.address,
        erc20Contract.nonces(userAddressPub),
        constants.PERMIT_DEADLINE,
        amount
        )

    const lockTx = await bridgeContract.lock(
        userAddressPub,
        tokenAddress,
        tokenSymbol,
        amount,
        constants.PERMIT_DEADLINE,
        v,
        r,
        s
    )
    await lockTx.wait()

    printTransactionOutput(lockTx)
}

export async function release(
    tokenAddress: string,
    tokenSymbol: string,
    amount: BigNumber,
    privateKey: string) {
    //   // calculate fee
    //     // calculate gas
    //     // list to user

    // DB checks
    const wallet = getWallet(privateKey);
    const bridgeContract = getBridgeContract(wallet);

    const releaseTx = await bridgeContract.release(amount, tokenAddress, tokenSymbol)
    await releaseTx.wait()

    printTransactionOutput(releaseTx)
}

function getGenericERC20Contract(wallet: Wallet, tokenContractAddress: string) {
     return new ethers.Contract(
        tokenContractAddress,
        genericERC20.abi,
        wallet
    );
}


function getBridgeContract(wallet: Wallet) {
    return new ethers.Contract(
        contractAddress,
        bridge.abi,
        wallet
    );
}

function getUserPrivateKey(cliKeyInput: string) {
    if (cliKeyInput == null) {
        let secretsKey = secrets.PRIVATE_KEY;
        if (secretsKey == null) {
            throw new MissingPrivateKeyException('Wallet private key was not provided. Transaction will not execute.');
        }
        return secretsKey;
    }
    return cliKeyInput;
}

function getProvider() {
    if (config.PROJECT_SETTINGS.isSourceLocal) {
        return new ethers.providers.JsonRpcProvider(
            "http://localhost:8545"
        );
    }
    return new ethers.providers.InfuraProvider(
        "sepolia",
        secrets.INFURA_KEY
    );
}

function getWallet(privateKey: string) {
    return new ethers.Wallet(
        getUserPrivateKey(privateKey),
        provider
    );
}

function printTransactionOutput(transaction: any) {
    console.info('Completed transaction output:');
    console.info(transaction);
}

function printTransactionPriorEstimations(feeEstimate: any, gasEstimate: any) {
    console.info('Completed transaction output:');
}
