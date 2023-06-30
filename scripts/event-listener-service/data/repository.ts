import { getConnection } from 'typeorm';
import { TokensBurnt} from '../../entity/TokensBurnt';
import { TokensLocked} from '../../entity/TokensLocked';
import { TokensReleased} from '../../entity/TokensReleased';
import { TokensMinted} from '../../entity/TokensMinted';
import {Token} from "../../entity/Token";
import {AppDataSource} from "./data-source";
import {EventNotFound} from '../../utils/exceptions/EventNotFound'

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

export async function saveLockedEvent(lockEvent: TokensLocked): Promise<TokensLocked> {
    await AppDataSource.manager.save(lockEvent)
    console.log('Processed lock event in DB')
}

export async function updateLockedEvent(address: string, updatedEvent: Partial<TokensLocked>): Promise<any[]> {
    const connection = getConnection();
    const lockEventRepository = connection.getRepository(TokensLocked);

    const lockEvents = await lockEventRepository.find({ where: { ['userAddress']: address } });
    if (!lockEvents) {
        throw new EventNotFound('TokensLocked event not present in database')
    }
    const updatedLock = Object.assign(lockEvents, updatedEvent);
    await lockEventRepository.save(updatedLock);
    return updatedLock;
}

export async function saveBurntEvent(burnEvent: TokensBurnt): Promise<TokensBurnt> {
    await AppDataSource.manager.save(burnEvent)
    console.log('Processed burn event in DB')
}

export async function updateBurntEvent(address: string, updatedEvent: Partial<TokensBurnt>): Promise<any[]> {
    const connection = getConnection();
    const burnEventRepository = connection.getRepository(TokensBurnt);

    const burnEvents = await burnEventRepository.find({ where: { ['userAddress']: address } });
    if (!burnEvents) {
        throw new EventNotFound('TokensBurned event not present in database')
    }
    const updatedBurn = Object.assign(burnEvents, updatedEvent);
    await burnEventRepository.save(updatedBurn);
    return updatedBurn;
}

export async function saveReleaseEvent(releaseEvent: TokensReleased): Promise<TokensReleased> {
    await AppDataSource.manager.save(releaseEvent)
    console.log('Processed release event in DB')
}

export async function updateReleaseEvent(address: string, updatedEvent: Partial<TokensReleased>): Promise<any[]> {
    const connection = getConnection();
    const releaseEventRepository = connection.getRepository(TokensReleased);

    const releaseEvents = await releaseEventRepository.find({ where: { ['userAddress']: address } });
    if (!releaseEvents) {
        throw new EventNotFound('TokensReleased event not present in database')
    }
    const updatedRelease = Object.assign(releaseEvents, updatedEvent);
    await releaseEventRepository.save(updatedRelease);
    return updatedRelease;
}

export async function saveMintEvent(mintEvent: TokensMinted) {
    await AppDataSource.manager.save(mintEvent)
    console.log('Processed mint event in DB')
}

export async function updateMintEvent(address: string, updatedEvent: Partial<TokensMinted>): Promise<any[]> {
    const connection = getConnection();
    const mintEventRepository = connection.getRepository(TokensMinted);

    const mintEvents = await mintEventRepository.find({ where: { ['userAddress']: address } });
    if (!mintEvents) {
        throw new EventNotFound('TokensMinted event not present in database')
    }
    const updatedMint = Object.assign(mintEvents, updatedEvent);
    await mintEventRepository.save(updatedMint);
    return updatedMint;
}