import {ethers} from "ethers";
import {TokensLocked} from "../../entity/TokensLocked";
import {Token} from "../../entity/Token";
import {TokensBurnt} from "../../entity/TokensBurnt";

const repository = require('./../data/repository')
const config = require('../../../config.json')


export async function parseDecodedLockEvent(decodedLock: any, topics) {
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
            amount._hex,
            amount.toString(),
            chainId.toString(),
            config.PROJECT_SETTINGS.BRIDGE_CONTRACT_SOURCE,
            false,
            timestamp.toString(),
            true)

        await repository.saveLockedEvent(lockEntity)
    }
}

export async function parseNewTokenEvent(decodedNewToken: any, topics) {
    if (decodedNewToken) {
        const decoder = new ethers.utils.AbiCoder();

        const tokenAddress = await decoder.decode(["address"], topics[topics.length - 1])
        const tokenSymbol = decodedNewToken['tokenSymbol']
        const tokenName = decodedNewToken['tokenName']
        const chainId = decodedNewToken['chainId']
        let tokenType = chainId==5 ? 'wrapped' : 'generic'

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

// {
//     blockNumber: 9282198,
//         blockHash: '0xafd42811b3a9141eb674d7afdf67eca772f73191c9da33cd35da2ce51e240217',
//     transactionIndex: 72,
//     removed: false,
//     address: '0xeFecc8876f4Bf283CA4a94676030137E376428EB',
//     data: '0x000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000003e800000000000000000000000000000000000000000000000000000000000000050000000000000000000000000000000000000000000000000000000064a2896000000000000000000000000000000000000000000000000000000000000000055754543131000000000000000000000000000000000000000000000000000000',
//     topics: [
//     '0xaadf731dcacbac5660c96b5e77c4d6ba4b36ccf06b90767c9f48a43173696cd7',
//     '0x0000000000000000000000001f4e2783a1d87c1acca77e081396b9305a96a4c0',
//     '0x00000000000000000000000046d1a25a8af5c0b3ff844ab86c23a93b1af20027'
// ],
//     transactionHash: '0x45f1b39611e6b95b5fe54a93a06123ecdfac6c9d75939c1495e21ccd072283b0',
//     logIndex: 175
// }
// [
//     Indexed { _isIndexed: true, hash: null },
//     'WTT11',
//     Indexed { _isIndexed: true, hash: null },
//     BigNumber { _hex: '0x03e8', _isBigNumber: true },
//     BigNumber { _hex: '0x05', _isBigNumber: true },
//     BigNumber { _hex: '0x64a28960', _isBigNumber: true },
//     user: Indexed { _isIndexed: true, hash: null },
// tokenSymbol: 'WTT11',
//     tokenAddress: Indexed { _isIndexed: true, hash: null },
// amount: BigNumber { _hex: '0x03e8', _isBigNumber: true },
// chainId: BigNumber { _hex: '0x05', _isBigNumber: true },
// timestamp: BigNumber { _hex: '0x64a28960', _isBigNumber: true }
// ]
// updateUse

export async function parseBurnEvent(decodedNewToken: any, topics) {
    const decoder = new ethers.utils.AbiCoder();
    const userAddress = await decoder.decode(["address"], topics[topics.length - 2])
    const tokenAddress = await decoder.decode(["address"], topics[topics.length - 1])
    if (decodedNewToken) {
        const tokenSymbol = decodedNewToken['tokenSymbol']
        const amount = decodedNewToken['amount']
        const chainId = decodedNewToken['chainId']
        const timestamp = decodedNewToken['timestamp']

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