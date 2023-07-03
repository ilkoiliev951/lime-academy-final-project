import { TokensBurnt} from '../../entity/TokensBurnt';
import { TokensLocked} from '../../entity/TokensLocked';
import { TokensReleased} from '../../entity/TokensReleased';
import { TokensMinted} from '../../entity/TokensMinted';
import {Token} from "../../entity/Token";
import {AppDataSource} from "./data-source";

export async function applyDBSchemaChanges() {
    try {
       await AppDataSource.connect()
    } catch (e) {
        console.log(e)
    }
}

export async function saveNewTokenEvent(newTokenEvent: Token): Promise<Token> {
    const userRepository = AppDataSource.getRepository(Token);
    return await userRepository.save(newTokenEvent);
}

export async function saveLockedEvent(lockEvent: TokensLocked) {
    let res = await AppDataSource.manager.findOneBy(TokensLocked, {
        timestamp: lockEvent.timestamp,
    })
    if (!res) {
        await AppDataSource.manager.save(lockEvent)
    }
    console.log('Processed lock event in DB')
}

export async function updateLockedEvent(userAddress, amount, tokenSymbol) {
    const token2 = await getTokenOnOtherChain(tokenSymbol)
    if (token2) {
        const lockEvent = await AppDataSource.manager
            .createQueryBuilder(TokensLocked, "event")
            .where("event.userAddress=:address", {address: userAddress})
            .andWhere("event.tokenSymbol=:tokenSymbol", {tokenSymbol: token2.tokenSymbol})
            .andWhere("event.amount=:amount", {amount: amount})
            .andWhere('event.active IS TRUE')
            .getOne()

        if (lockEvent) {
            console.log(lockEvent)
            const lockId = lockEvent.id
            await AppDataSource.manager.update(TokensLocked, {id: lockId}, {claimedOnTarget: true, active: false})
            console.log('updated lock')
        }
    }
}

export async function saveBurntEvent(burnEvent: TokensBurnt) {
    await AppDataSource.manager.save(burnEvent)
    console.log('Processed burn event in DB')
}

export async function updateBurntEvent (userAddress, amount, tokenSymbol){
    const token2 = await getTokenOnOtherChain(tokenSymbol)
    if (token2) {
        const burnEvent = await AppDataSource.manager
            .createQueryBuilder(TokensLocked, "event")
            .where("event.userAddress=:address", {address: userAddress})
            .andWhere("event.tokenSymbol=:tokenSymbol", {tokenSymbol: token2.tokenSymbol})
            .andWhere("event.amount=:amount", {amount: amount})
            .andWhere('event.releasedOnSource IS FALSE')
            .getOne()

        if (burnEvent) {
            const burnId = burnEvent.id
            await AppDataSource.manager.update(TokensBurnt, {id: burnId}, {releasedOnSource: true})
            console.log('updated burn')
        }
    }
}

export async function saveReleaseEvent(releaseEvent: TokensReleased) {
    await AppDataSource.manager.save(releaseEvent)
    console.log('Processed release event in DB')
}

export async function saveMintEvent(mintEvent: TokensMinted) {
    await AppDataSource.manager.save(mintEvent)
    console.log('Processed mint event in DB')
}

async function getTokenOnOtherChain (symbol: string) {
    const token1 = await AppDataSource.manager
        .createQueryBuilder(Token, "token")
        .where("token.tokenSymbol = :symbol", { symbol: symbol})
        .getOne()

    if (token1) {
        const mappedSymbol = token1.mappedToTokenSymbol
        const token2 = await AppDataSource.manager
            .createQueryBuilder(Token, "token")
            .where("token.tokenSymbol = :mappedSymbol", { mappedSymbol: mappedSymbol})
            .getOne()

        return token2;
    }
}