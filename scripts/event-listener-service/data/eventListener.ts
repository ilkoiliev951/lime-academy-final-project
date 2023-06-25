import process from "process";
import secrets from "../../../secrets.json";
import {HARDHAT_URL, SOURCE_NETWORK_TYPE, TARGET_NETWORK_TYPE} from "../constants";
import {Token} from "./entity/Token";
import {TokensMinted} from "./entity/TokensMinted";

const {ethers} = require('ethers');
const config = require('./../../../config.json')
const bridge = require("./../../../artifacts/contracts/EVMBridge.sol/EVMBridge.json");
const repository = require('./repository')

const targetProvider = new ethers.providers.WebSocketProvider('wss://sepolia-testnet-url');
const contractTarget = getContract(TARGET_NETWORK_TYPE, targetProvider);

const sourceProvider = getProvider(SOURCE_NETWORK_TYPE)
const contractSource = getContract(SOURCE_NETWORK_TYPE, sourceProvider)

const main = async () => {
    // Apply DB schema changes on start up, if any
    await applyDBChanges();
    // Register the event listeners on both contracts
    await registerSourceNetworkEventListeners()
    await registerTargetNetworkEventListeners();
}

async function registerTargetNetworkEventListeners() {
    contractSource.on('NewTokenCreated', (tokenSymbol, tokenName, tokenAddress, chainId, timestamp) => {
        console.log('Intercepted NewTokenCreated event')
        const token = new Token(tokenSymbol, tokenName, tokenAddress, 'wrapped', chainId.toString())
        repository.saveNewTokenEvent(token)
    });

    contractSource.on('TokenAmountMinted', (user, tokenSymbol, tokenName, amount, chainId, timestamp) => {
        console.log('Intercepted TokenAmountMinted event')
        // this.tokenSymbol = tokenSymbol;
        // this.tokenAddress = tokenAddress;
        // this.userAddress = userAddress;
        // this.amount = amount;
        // this.chainId = chainId;
        // this.timestamp = timestamp;
        const token = new TokensMinted(tokenSymbol, )
        repository.saveNewTokenEvent(token)
    });

    contractSource.on('TokenAmountBurned', (user, tokenSymbol, amount, chainId, timestamp) => {
        console.log('Intercepted TokenAmountBurned event')
    });
}

async function registerSourceNetworkEventListeners() {
    contractTarget.on('NewTokenCreated', (tokenSymbol, tokenName, tokenAddress, chainId, timestamp) => {
        console.log('Intercepted NewTokenCreated event')
    });

    contractTarget.on('TokenAmountLocked', (user, tokenSymbol, tokenAddress, amount, lockedInContract, chainId, timestamp) => {
        console.log('Intercepted TokenAmountLocked event')
    });

    contractTarget.on('TokenAmountReleased', (event) => {
        console.log('Intercepted TokenAmountReleased event')
    });
}

async function readBlocksOnSourceFrom () {

}

async function readBlocksOnTargetFrom () {

}

function getProvider(networkType) {
    if (networkType === SOURCE_NETWORK_TYPE) {
        return new ethers.providers.JsonRpcProvider(
            HARDHAT_URL
        );
    }
    return new ethers.providers.InfuraProvider(
        "sepolia",
        secrets.INFURA_KEY
    );
}

function getContract(networkType, provider) {
    if (networkType === SOURCE_NETWORK_TYPE) {
        return new ethers.Contract(config.PROJECT_SETTINGS.BRIDGE_CONTRACT_SOURCE, bridge.abi, provider);
    }
    return new ethers.Contract(config.PROJECT_SETTINGS.BRIDGE_CONTRACT_TARGET, bridge.abi, provider);
}

async function applyDBChanges () {
    await repository.applyDBChanges();
}

main()

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});