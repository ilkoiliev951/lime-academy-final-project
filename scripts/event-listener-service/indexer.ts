import process from "process";
import secrets from "../../secrets.json";
import {SOURCE_NETWORK_TYPE, TARGET_NETWORK_TYPE} from "./utils/constants";
import {Token} from "../entity/Token";
import {TokensMinted} from "../entity/TokensMinted";
import {TokensBurnt} from "../entity/TokensBurnt";
import {TokensLocked} from "../entity/TokensLocked";
import {TokensReleased} from "../entity/TokensReleased";

const {ethers} = require('ethers');
const config = require('../../config.json')
const bridge = require("../../artifacts/contracts/EVMBridge.sol/EVMBridge.json");
const repository = require('./data/repository')

const targetProvider = getWebSocketProvider(TARGET_NETWORK_TYPE)
const contractTarget = getContract(TARGET_NETWORK_TYPE, targetProvider);

const sourceProvider = getWebSocketProvider(SOURCE_NETWORK_TYPE)
const contractSource = getContract(SOURCE_NETWORK_TYPE, sourceProvider)

const main = async () => {
    // Apply DB schema changes on start up, if any
    await repository.applyDBSchemaChanges();
    // Check for newly created tokens and update the db
   // await
    // Register the event listeners on both contracts
    await registerSourceNetworkEventListeners();
    await registerTargetNetworkEventListeners();
}

async function registerSourceNetworkEventListeners() {
    contractSource.on('NewTokenCreated', (tokenSymbol, tokenName, tokenAddress, chainId, timestamp) => {
        console.log('Intercepted NewTokenCreated event')
        const token: Token = new Token(tokenSymbol, tokenName, tokenAddress, 'wrapped', chainId.toString())
        repository.saveNewTokenEvent(token)
    });

    contractSource.on('TokenAmountLocked', (user, tokenSymbol, tokenAddress, amount, lockedInContract, chainId, timestamp) => {
        console.log('Intercepted TokenAmountLocked event')

        const lockEvent: TokensLocked = new TokensLocked(tokenSymbol, tokenAddress, user, amount.toString(), chainId.toString(), lockedInContract.toString(), false, timestamp, true);
        repository.saveLockedEvent(lockEvent);
    });

    contractSource.on('TokenAmountReleased', (user, tokenSymbol, tokenAddress, amount, chainId, timestamp) => {
        console.log('Intercepted TokenAmountReleased event')
        const releaseEvent: TokensReleased = new TokensReleased(tokenSymbol, tokenAddress, user, amount, chainId.toString(), timestamp)
        repository.saveReleaseEvent(releaseEvent);
    });

    console.log('Listening on EVM Bridge Source')
}

async function registerTargetNetworkEventListeners() {
    contractTarget.on('NewTokenCreated', (tokenSymbol, tokenName, tokenAddress, chainId, timestamp) => {
        console.log('Intercepted NewTokenCreated event')
        const token: Token = new Token(tokenSymbol, tokenName, tokenAddress, 'generic', chainId.toString())
        repository.saveNewTokenEvent(token)
    });

    contractTarget.on('TokenAmountMinted', (user, tokenSymbol, tokenAddress, amount, chainId, timestamp) => {
        console.log('Intercepted TokenAmountMinted event')
        console.log('AMOUNT' + amount.toString())
        const mintEvent: TokensMinted = new TokensMinted(tokenSymbol, tokenAddress, user, amount.toString(), chainId, timestamp);
        repository.saveMintEvent(mintEvent);
    });

    contractTarget.on('TokenAmountBurned', (user, tokenAddress, tokenSymbol, amount, chainId, timestamp) => {
        console.log('Intercepted TokenAmountBurned event')
        const burntEvent: TokensBurnt = new TokensBurnt(tokenSymbol, tokenAddress, user, amount, chainId, false, timestamp);
        repository.saveBurntEvent(burntEvent);
    });
    console.log('Listening on EVM Bridge Source')
}

async function readBlocksOnSourceFrom (blockNumber: number) {
    readBlocksOnSourceFrom(blockNumber)
        .catch((error) => {
            console.error('Error:', error);
        });
}

async function readBlocksOnTargetFrom (block: number) {
    // verify, that the transaction is complete on the block
}

async function readBlocks(startBlockNumber: number): Promise<void> {
    const provider = new ethers.providers.JsonRpcProvider('https://sepolia-testnet-url'); // Replace 'https://sepolia-testnet-url' with the actual Sepolia testnet URL

    const currentBlockNumber = await provider.getBlockNumber();

    for (let blockNumber = startBlockNumber; blockNumber <= currentBlockNumber; blockNumber++) {
        const block = await provider.getBlock(blockNumber);
        console.log(block);
        // Process or extract data from the block as needed
    }
}

// function checkForNewTokens () {
//     // make 2 requests on both networks
//
//     // check in db
//
//     // update if needed
//
// }

function getWebSocketProvider(networkType) {
    if (networkType === SOURCE_NETWORK_TYPE) {
        return new ethers.providers.WebSocketProvider(secrets.INFURA_SEPOLIA_SOCKET_URL);
    }
    return new ethers.providers.WebSocketProvider(secrets.INFURA_GOERLI_SOCKET_URL);
}

function getContract(networkType, provider) {
    if (networkType === SOURCE_NETWORK_TYPE) {
        return new ethers.Contract(config.PROJECT_SETTINGS.BRIDGE_CONTRACT_SOURCE, bridge.abi, provider);
    }
    return new ethers.Contract(config.PROJECT_SETTINGS.BRIDGE_CONTRACT_TARGET, bridge.abi, provider);
}

main()

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});