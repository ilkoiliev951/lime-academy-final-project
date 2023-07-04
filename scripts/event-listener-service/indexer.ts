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
const bridge= require("../../artifacts/contracts/EVMBridge.sol/EVMBridge.json");
const repository = require('./data/repository')

const targetProvider = getWebSocketProvider(TARGET_NETWORK_TYPE)
const contractTarget = getContract(TARGET_NETWORK_TYPE, targetProvider);

const sourceProvider = getWebSocketProvider(SOURCE_NETWORK_TYPE)
const contractSource = getContract(SOURCE_NETWORK_TYPE, sourceProvider)

const main = async () => {
    await repository.connect();

    // Read blocks and process events from last saved event number
    await readBlocksOnSourceFrom(await repository.getLastProcessedTargetBlock())
    await readBlocksOnTargetFrom(await repository.getLastProcessedTargetBlock())

    // Register the event listeners on both contracts
    await registerSourceNetworkEventListeners();
    await registerTargetNetworkEventListeners();
}

async function registerSourceNetworkEventListeners() {
    contractSource.on('NewTokenCreated', async (tokenSymbol, tokenName, tokenAddress, chainId, timestamp) => {
        console.log('Intercepted NewTokenCreated event')
        const token: Token = new Token(tokenSymbol, tokenName, tokenAddress, 'wrapped', chainId.toString())
        await repository.saveNewTokenEvent(token)
    });

    contractSource.on('TokenAmountLocked', async (user, tokenSymbol, tokenAddress, amount, lockedInContract, chainId, timestamp) => {
        console.log('Intercepted TokenAmountLocked event')

        const lockEvent: TokensLocked = new TokensLocked(tokenSymbol, tokenAddress, user, amount.toString(), chainId.toString(), lockedInContract.toString(), false, timestamp, true);
        await repository.saveLockedEvent(lockEvent);
    });

    contractSource.on('TokenAmountReleased', async (user, tokenSymbol, tokenAddress, amount, chainId, timestamp) => {
        console.log('Intercepted TokenAmountReleased event')
        const releaseEvent: TokensReleased = new TokensReleased(tokenSymbol, tokenAddress, user, amount, chainId.toString(), timestamp)
        await repository.saveReleaseEvent(releaseEvent);
        await repository.updateBurntEvent(user, amount.toString(), tokenSymbol)
    });

    console.log('Listening on EVM Bridge Source Contract')
}

async function registerTargetNetworkEventListeners() {
    contractTarget.on('NewTokenCreated', async (tokenSymbol, tokenName, tokenAddress, chainId, timestamp) => {
        console.log('Intercepted NewTokenCreated event')
        const token: Token = new Token(tokenSymbol, tokenName, tokenAddress, 'generic', chainId.toString())
        await repository.saveNewTokenEvent(token)
    });

    contractTarget.on('TokenAmountMinted', async (user, tokenSymbol, tokenAddress, amount, chainId, timestamp) => {
        console.log('Intercepted TokenAmountMinted event')
        const mintEvent: TokensMinted = new TokensMinted(tokenSymbol, tokenAddress, user, amount.toString(), chainId, timestamp);
        await repository.saveMintEvent(mintEvent);
        await repository.updateLockedEvent(user, amount.toString(), tokenSymbol)
    });

    contractTarget.on('TokenAmountBurned', async (user, tokenAddress, tokenSymbol, amount, chainId, timestamp) => {
        console.log('Intercepted TokenAmountBurned event')
        const burntEvent: TokensBurnt = new TokensBurnt(tokenSymbol, tokenAddress, user, amount, chainId, false, timestamp);
        await repository.saveBurntEvent(burntEvent);
    });
    console.log('Listening on EVM Bridge Target Contract')
}

async function readBlocksOnSourceFrom (blockNumber: number) {
    readBlocksOnSourceFrom(blockNumber)
        .catch((error) => {
            console.error('Error:', error);
        });
}

async function readBlocksOnTargetFrom (blockNumber: number) {
    const provider =  getWebSocketProvider(TARGET_NETWORK_TYPE)

    const iface = new ethers.utils.Interface(bridge.abi);
    const logs = await provider.getLogs({
        fromBlock: blockNumber,
        toBlock: provider.getBlockNumber(),
        address: config.PROJECT_SETTINGS.BRIDGE_CONTRACT_TARGET
    });

    for (let i = 0; i <logs.length ; i++) {
        // Process Mint Events if any
        console.log(iface.decodeEventLog("NewTokenCreated", logs[i].data))
    }


    for (let i = 0; i <logs.length ; i++) {
        // Process Mint Events if any
        console.log(iface.decodeEventLog("TokenAmountMinted", logs[i].data))
    }


    for (let i = 0; i <logs.length ; i++) {
        // Process Burn Events if any
        iface.decodeEventLog("TokenAmountBurned", logs[i].data)
    }

}

async function readBlocksOnSource(startingBlock: number) {
    if (startingBlock!=0) {
        const provider = getWebSocketProvider(SOURCE_NETWORK_TYPE)

        const iface = new ethers.utils.Interface(bridge.abi);
        const logs = await provider.getLogs({
            fromBlock: startingBlock,
            toBlock: provider.getBlockNumber(),
            address: config.PROJECT_SETTINGS.BRIDGE_CONTRACT_SOURCE
        });

        for (let i = 0; i < logs.length; i++) {
            // Process Mint Events if any
            const newTokenEvent = iface.decodeEventLog("NewTokenCreated", logs[i].data)
            // const tokenSymbol =
            // const tokenName
            // const tokenAddress
            //
            //
            // const token: Token = new Token(tokenSymbol, tokenName, tokenAddress, 'wrapped', chainId.toString())
            // await repository.saveNewTokenEvent(token)
        }

        for (let i = 0; i < logs.length; i++) {
            // Process Lock Events if any
            console.log(iface.decodeEventLog("TokenAmountLocked", logs[i].data))
        }

        for (let i = 0; i < logs.length; i++) {
            // Process Release Events if any
            iface.decodeEventLog("TokenAmountReleased", logs[i].data)
        }
    } else {
        console.info()
    }
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

main()

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});