import process from "process";
import secrets from "../../secrets.json";
import {HARDHAT_URL, SOURCE_NETWORK_TYPE, TARGET_NETWORK_TYPE} from "./utils/constants";
import {Token} from "../entity/Token";
import {TokensMinted} from "../entity/TokensMinted";
import {TokensBurnt} from "../entity/TokensBurnt";
import {TokensLocked} from "../entity/TokensLocked";
import {TokensReleased} from "../entity/TokensReleased";

const {ethers} = require('ethers');
const config = require('../../config.json')
const bridge = require("../../artifacts/contracts/EVMBridge.sol/EVMBridge.json");
const repository = require('./data/repository')

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
        const token: Token = new Token(tokenSymbol, tokenName, tokenAddress, 'wrapped', chainId.toString())
        repository.saveNewTokenEvent(token)
    });

    contractSource.on('TokenAmountMinted', (user, tokenSymbol, tokenAddress, amount, chainId, timestamp) => {
        console.log('Intercepted TokenAmountMinted event')
        const mintEvent: TokensMinted = new TokensMinted(tokenSymbol, tokenAddress, user, amount, chainId, timestamp);
        repository.saveMintEvent(mintEvent);
    });

    contractSource.on('TokenAmountBurned', (user, tokenAddress, tokenSymbol, amount, chainId, timestamp) => {
        console.log('Intercepted TokenAmountBurned event')
        const burntEvent: TokensBurnt = new TokensBurnt(tokenSymbol, tokenAddress, user, amount, chainId, false, timestamp);
        repository.saveBurntEvent(burntEvent);
    });
}

async function registerSourceNetworkEventListeners() {
    contractTarget.on('NewTokenCreated', (event, tokenSymbol, tokenName, tokenAddress, chainId, timestamp) => {
        console.log('Intercepted NewTokenCreated event')
        const token: Token = new Token(tokenSymbol, tokenName, tokenAddress, 'generic', chainId.toString())
        repository.saveNewTokenEvent(token)
    });

    contractTarget.on('TokenAmountLocked', (event, user, tokenSymbol, tokenAddress, amount, lockedInContract, chainId, timestamp) => {
        console.log('Intercepted TokenAmountLocked event')
        const lockEvent: TokensLocked = new TokensLocked(tokenSymbol, tokenAddress, user, amount, chainId.toString(), lockedInContract, false, timestamp, true);
        repository.saveLockedEvent(lockEvent);
    });

    contractTarget.on('TokenAmountReleased', (event, user, tokenSymbol, tokenAddress, amount, chainId, timestamp) => {
        console.log('Intercepted TokenAmountReleased event')
        const releaseEvent: TokensReleased = new TokensReleased(tokenSymbol, tokenAddress, user, amount, chainId.toString(), timestamp)
        repository.saveReleaseEvent(releaseEvent);
    });
}

async function readBlocksOnSourceFrom (block: number) {

}

async function readBlocksOnTargetFrom (block: number) {
    // verify, that the transaction is complete on the block
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