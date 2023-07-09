import process from "process";
import secrets from "../../secrets.json";
import {SOURCE_NETWORK_TYPE, TARGET_NETWORK_TYPE} from "./utils/constants";
import {Token} from "../entity/Token";
import {TokensMinted} from "../entity/TokensMinted";
import {TokensBurnt} from "../entity/TokensBurnt";
import {TokensLocked} from "../entity/TokensLocked";
import {TokensReleased} from "../entity/TokensReleased";
import {
    getLastProcessedSourceBlock,
    getLastProcessedTargetBlock,
} from "./data/repository";

const {ethers} = require('ethers');
const config = require('../../config.json')
const bridge = require("../../artifacts/contracts/EVMBridge.sol/EVMBridge.json");
const repository = require('./data/repository')
const parser = require('./utils/parser')

const targetProvider = getWebSocketProvider(TARGET_NETWORK_TYPE)
const contractTarget = getContract(TARGET_NETWORK_TYPE, targetProvider);

const sourceProvider = getWebSocketProvider(SOURCE_NETWORK_TYPE)
const contractSource = getContract(SOURCE_NETWORK_TYPE, sourceProvider)

const main = async () => {
    // Establish initial DB connection
    await repository.connect();

    // Read blocks and process events from last saved event number
    await readBlocksOnSourceFrom(await getLastProcessedSourceBlock())
    await readBlocksOnTargetFrom(await getLastProcessedTargetBlock())

    // Register the event listeners on both contracts
    await registerSourceNetworkEventListeners();
    await registerTargetNetworkEventListeners();
}

async function registerSourceNetworkEventListeners() {
    contractSource.on('NewTokenCreated', async (tokenSymbol, tokenName, tokenAddress, chainId, timestamp, {blockNumber}) => {
        console.log('Intercepted NewTokenCreated event')
        const token: Token = new Token(tokenSymbol, tokenName, tokenAddress, 'wrapped', chainId.toString(), tokenName.toString().replace('G', 'W'))
        await repository.saveNewTokenEvent(token)
        await repository.updateLastProcessedSourceBlock(blockNumber, timestamp.toString())
    });

    contractSource.on('TokenAmountLocked', async (user, tokenSymbol, tokenAddress, amount, lockedInContract, chainId, timestamp, {blockNumber}) => {
        console.log('Intercepted TokenAmountLocked event')
        const lockEvent: TokensLocked = new TokensLocked(tokenSymbol, tokenAddress, user, amount.toString(), chainId.toString(), lockedInContract.toString(), false, timestamp.toString(), true);
        await repository.saveLockedEvent(lockEvent);
        await repository.updateLastProcessedSourceBlock(blockNumber, timestamp.toString())
    });

    contractSource.on('TokenAmountReleased', async (user, tokenSymbol, tokenAddress, amount, chainId, timestamp, {blockNumber}) => {
        console.log('Intercepted TokenAmountReleased event')
        const releaseEvent: TokensReleased = new TokensReleased(tokenSymbol, tokenAddress, user, amount.toString(), chainId.toString(), timestamp.toString())
        await repository.saveReleaseEvent(releaseEvent);
        await repository.updateBurntEvent(user, amount.toString(), tokenSymbol)
        await repository.updateLastProcessedSourceBlock(blockNumber, timestamp.toString())
    });
    console.log('Listening on EVM Bridge Source Contract')
}

async function registerTargetNetworkEventListeners() {
    contractTarget.on('NewTokenCreated', async (tokenSymbol, tokenName, tokenAddress, chainId, timestamp, {blockNumber}) => {
        console.log('Intercepted NewTokenCreated event')
        const token: Token = new Token(tokenSymbol, tokenName, tokenAddress, 'generic', chainId.toString(), tokenName.toString().replace('W', 'G'))
        await repository.saveNewTokenEvent(token)
        await repository.updateLastProcessedTargetBlock(blockNumber, timestamp.toString())
    });

    contractTarget.on('TokenAmountMinted', async (user, tokenSymbol, tokenAddress, amount, chainId, timestamp, {blockNumber}) => {
        console.log('Intercepted TokenAmountMinted event')
        const mintEvent: TokensMinted = new TokensMinted(tokenSymbol, tokenAddress, user, amount.toString(), chainId.toString(), timestamp.toString());
        await repository.saveMintEvent(mintEvent);
        await repository.updateLockedEvent(user, amount.toString(), tokenSymbol)
        await repository.updateLastProcessedTargetBlock(blockNumber, timestamp.toString())
    });

    contractTarget.on('TokenAmountBurned', async (user, tokenSymbol, tokenAddress, amount, chainId, timestamp, {blockNumber}) => {
        console.log('Intercepted TokenAmountBurned event')
        const burntEvent: TokensBurnt = new TokensBurnt(tokenSymbol, tokenAddress, user, amount.toString(), chainId.toString(), false, timestamp.toString());
        await repository.saveBurntEvent(burntEvent);
        await repository.updateLastProcessedTargetBlock(blockNumber, timestamp.toString())
    });
    console.log('Listening on EVM Bridge Target Contract')
}

async function readBlocksOnTargetFrom(startingBlock: number | null) {
    console.log('Starting to read blocks on target with initial number: ' + startingBlock)
    if (startingBlock != null) {
        startingBlock++;
        const provider = getWebSocketProvider(TARGET_NETWORK_TYPE)
        const logs = await provider.getLogs({
            fromBlock: startingBlock,
            toBlock: provider.getBlockNumber(),
            address: config.PROJECT_SETTINGS.BRIDGE_CONTRACT_TARGET
        }).catch((err: string) => console.error("Failed fetching logs with: ", err))

        if (logs) {
            for (let i = 0; i < logs.length; i++) {
                try {
                    const topics = logs[i].topics
                    const tx = await provider.getTransaction(logs[i].transactionHash)
                    const iface = new ethers.utils.Interface(bridge.abi);
                    const methodId = tx.data.substring(0, 10);
                    const method = iface.getFunction(methodId).name;

                    switch (method) {
                        case 'createToken':
                            const decodedNewToken = iface.decodeEventLog("NewTokenCreated", logs[i].data);
                            await parser.parseNewTokenEvent(decodedNewToken, topics)
                            await repository.updateLastProcessedTargetBlock(logs[i].blockNumber, decodedNewToken['timestamp'].toString())
                            break;
                        case 'mint':
                            console.log('Saving unprocessed mint event.')
                            const decodedMint = iface.decodeEventLog("TokenAmountMinted", logs[i].data);
                            await parser.parseMintEvent(decodedMint, topics, tx.to)
                            await repository.updateLastProcessedTargetBlock(logs[i].blockNumber, decodedMint['timestamp'].toString())
                            break;
                        case 'burnWithPermit':
                            console.log('Saving unprocessed burn event.')
                            const decodedBurn = iface.decodeEventLog("TokenAmountBurned", logs[i].data);
                            await parser.parseBurnEvent(decodedBurn, topics)
                            await repository.updateLastProcessedTargetBlock(logs[i].blockNumber, decodedBurn['timestamp'].toString())
                            break;
                        default:
                            break;
                    }
                } catch (e) {
                    console.log(e)
                }
            }
        } else {
            console.log('No logs found for the block range. Stopping block read on target.')
        }
    } else {
        console.info('No starting block exists in DB for target network')
    }
    console.log('Finished reading blocks on target')
}

async function readBlocksOnSourceFrom(startingBlock: number | null) {
    console.log('Starting to read blocks on source with initial number: ' + startingBlock)
    startingBlock++;
    if (startingBlock != null) {
        const provider = getWebSocketProvider(SOURCE_NETWORK_TYPE)
        const logs = await provider.getLogs({
            fromBlock: startingBlock,
            toBlock:  provider.getBlockNumber(),
            address: config.PROJECT_SETTINGS.BRIDGE_CONTRACT_SOURCE
        }).catch((err: string) => console.error("Failed fetching logs with: ", err))

        if (logs) {
            for (let i = 0; i < logs.length; i++) {
                try {
                    const topics = logs[i].topics
                    const tx = await provider.getTransaction(logs[i].transactionHash)
                    const iface = new ethers.utils.Interface(bridge.abi);
                    const methodId = tx.data.substring(0, 10);
                    const method = iface.getFunction(methodId).name;

                    switch (method) {
                        case 'createToken':
                            const decodedNewToken = iface.decodeEventLog("NewTokenCreated", logs[i].data);
                            await parser.parseNewTokenEvent(decodedNewToken, topics)
                            await repository.updateLastProcessedSourceBlock(logs[i].blockNumber, decodedNewToken['timestamp'].toString())
                            break;
                        case 'lock':
                            console.log('Saving unprocessed lock event.')
                            const decodedLock = iface.decodeEventLog("TokenAmountLocked", logs[i].data);
                            await parser.parseDecodedLockEvent(decodedLock, topics, tx.from)
                            await repository.updateLastProcessedSourceBlock(logs[i].blockNumber, decodedLock['timestamp'].toString())
                            break;
                        case 'release':
                            console.log('Saving unprocessed release event.')
                            const decodedRelease = iface.decodeEventLog("TokenAmountReleased", logs[i].data);
                            await parser.parseDecodedReleaseEvent(decodedRelease, topics, tx.to)
                            await repository.updateLastProcessedSourceBlock(logs[i].blockNumber, decodedRelease['timestamp'].toString())
                            break;
                        default:
                            break;
                    }
                } catch (e) {
                    console.log(e)
                }
            }
        } else {
            console.log('No logs found for the block range. Stopping block read on source.')
        }
    } else {
        console.info('No starting block exists in DB for source network')
    }
    console.log('Finished reading blocks on source')
}

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

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});