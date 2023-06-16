import {BigNumber, ethers, Wallet} from 'ethers';
const config = require('./../../../../config.json')
const bridge = require("../../../../artifacts/contracts/EVMBridge.sol/EVMBridge.json");
import secrets from '../../../../secrets.json';
import {MissingPrivateKeyException} from "../../exceptions/MissingPrivateKeyException";

const contractAddress = config.PROJECT_SETTINGS.BIRDGE_CONTRACT_SEPOLIA;
const provider = getProvider();

export async function createToken(
    privateKey: string,
    tokenName: string,
    tokenSymbol: string) {

    const wallet = getWallet(privateKey);
    const bridgeContract = getBridgeContract(wallet);
}

export async function lock(
    amount: BigNumber,
    tokenSymbol: string,
    tokenAddress: string,
    privateKey: string) {

    const wallet = getWallet(privateKey);
    const bridgeContract = getBridgeContract(wallet);
}

export async function release(
    tokenAddress: string,
    tokenSymbol: string,
    amount: BigNumber,
    privateKey: string) {

    const wallet = getWallet(privateKey);
    const bridgeContract = getBridgeContract(wallet);
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
    if (config.PROJECT_SETTINGS.isLocal) {
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

function logTransactionOutput(transaction: any) {
    console.info('Completed transaction output:');
    console.info(transaction);
}