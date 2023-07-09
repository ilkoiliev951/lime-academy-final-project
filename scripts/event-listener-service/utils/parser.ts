import {ethers} from "ethers";
import {TokensLocked} from "../../entity/TokensLocked";
import {Token} from "../../entity/Token";
import {TokensBurnt} from "../../entity/TokensBurnt";
import {TokensMinted} from "../../entity/TokensMinted";
import {TokensReleased} from "../../entity/TokensReleased";

const repository = require('./../data/repository')
const config = require('../../../config.json')


export async function parseDecodedLockEvent(decodedLock: any, topics, userAddress: string) {
    if (decodedLock) {
        const decoder = new ethers.utils.AbiCoder();

        const tokenAddress = await decoder.decode(["address"], topics[topics.length - 1])
        const tokenSymbol = decodedLock['tokenSymbol']
        const amount = decodedLock['amount']
        const chainId = decodedLock['chainId']
        const timestamp = decodedLock['timestamp']

        const lockEntity = new TokensLocked(
            tokenSymbol,
            tokenAddress.at(0),
            userAddress,
            amount.toString(),
            chainId.toString(),
            config.PROJECT_SETTINGS.BRIDGE_CONTRACT_SOURCE,
            false,
            timestamp.toString(),
            true)

        await repository.saveLockedEvent(lockEntity)
    }
}

export async function parseDecodedReleaseEvent(decodedRelease: any, topics, userAddress: string) {
    if (decodedRelease) {
        const decoder = new ethers.utils.AbiCoder();

        const userAddress = await decoder.decode(["address"], topics[topics.length - 2])
        const tokenAddress = await decoder.decode(["address"], topics[topics.length - 1])
        const tokenSymbol = decodedRelease['tokenSymbol']
        const amount = decodedRelease['amount']
        const chainId = decodedRelease['chainId']
        const timestamp = decodedRelease['timestamp']

        const releaseEntity = new TokensReleased(
            tokenSymbol,
            tokenAddress.at(0),
            userAddress.at(0),
            amount.toString(),
            chainId.toString(),
            timestamp.toString()
        )

        await repository.saveReleaseEvent(releaseEntity)
        await repository.updateBurntEvent(userAddress, amount.toString(), tokenSymbol)
    }
}

export async function parseNewTokenEvent(decodedNewToken: any, topics) {
    if (decodedNewToken) {
        const decoder = new ethers.utils.AbiCoder();

        const tokenAddress = await decoder.decode(["address"], topics[topics.length - 1])
        const tokenSymbol = decodedNewToken['tokenSymbol']
        const tokenName = decodedNewToken['tokenName']
        const chainId = decodedNewToken['chainId']
        let tokenType;

        if (chainId==5) {
            tokenType = 'wrapped'
        } else {
            tokenType = 'generic'
        }

        let mappedToTokenSymbol
        if(tokenType=='wrapped') {
            mappedToTokenSymbol = tokenName.toString().replace('G', 'W')
        } else {
            mappedToTokenSymbol = tokenName.toString().replace('W', 'G')
        }

        const tokenEntity = new Token(
            tokenSymbol,
            tokenName,
            tokenAddress.at(0),
            tokenType,
            chainId,
            mappedToTokenSymbol
        )

        await repository.saveNewTokenEvent(tokenEntity)
    }
}

export async function parseBurnEvent(decodedBurn: any, topics) {
    if (decodedBurn) {
        const decoder = new ethers.utils.AbiCoder();
        const userAddress = await decoder.decode(["address"], topics[topics.length - 2])
        const tokenAddress = await decoder.decode(["address"], topics[topics.length - 1])

        const tokenSymbol = decodedBurn['tokenSymbol']
        const amount = decodedBurn['amount']
        const chainId = decodedBurn['chainId']
        const timestamp = decodedBurn['timestamp']

        const burnEntity = new TokensBurnt(
            tokenSymbol,
            tokenAddress.at(0),
            userAddress.at(0),
            amount.toString(),
            chainId.toString(),
            false,
            timestamp.toString()
        )

        await repository.saveBurntEvent(burnEntity)
    }
}

export async function parseMintEvent(decodedMintToken: any, topics, userAddress: string) {
    if (decodedMintToken) {
        const decoder = new ethers.utils.AbiCoder();
        const userAddress = await decoder.decode(["address"], topics[topics.length - 2])
        const tokenAddress = await decoder.decode(["address"], topics[topics.length - 1])
        const tokenSymbol = decodedMintToken['tokenSymbol']
        const amount = decodedMintToken['amount']
        const chainId = decodedMintToken['chainId']
        const timestamp = decodedMintToken['timestamp']

        const mintEntity = new TokensMinted(
            tokenSymbol,
            tokenAddress.at(0),
            userAddress.at(0),
            amount.toString(),
            chainId.toString(),
            timestamp.toString()
        )

        await repository.saveMintEvent(mintEntity)
        await repository.updateLockedEvent(userAddress, amount.toString(), tokenSymbol)
    }
}