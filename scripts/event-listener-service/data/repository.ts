import { getConnection } from 'typeorm';
import { TokensBurnt} from '../../entity/TokensBurnt';
import { TokensLocked} from '../../entity/TokensLocked';
import { TokensReleased} from '../../entity/TokensReleased';
import { TokensMinted} from '../../entity/TokensMinted';
import { TransferRequest} from '../../entity/TransferRequest';
import {Token} from "../../entity/Token";
import {AppDataSource} from "./data-source";
import {EventNotFound} from '../../utils/exceptions/EventNotFound'

export async function applyDBChanges() {
    try {
       await AppDataSource.connect()
    } catch (e) {
        console.log(e)
    }
}

export async function saveNewTokenEvent(newTokenEvent: Token): Promise<Token> {
    const connection = getConnection();
    const userRepository = connection.getRepository(Token);

    return await userRepository.save(Token);
}

export async function saveLockedEvent(lockEvent: TokensLocked): Promise<TokensLocked> {
    const connection = getConnection();
    const userRepository = connection.getRepository(TokensLocked);

    return await userRepository.save(lockEvent);
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
    const connection = getConnection();
    const userRepository = connection.getRepository(TokensBurnt);

    return await userRepository.save(burnEvent);
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
    const connection = getConnection();
    const userRepository = connection.getRepository(TokensReleased);

    return await userRepository.save(releaseEvent);
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

export async function saveMintEvent(mintEvent: TokensMinted): Promise<TokensMinted> {
    const connection = getConnection();
    const userRepository = connection.getRepository(TokensMinted);

    return await userRepository.save(mintEvent);
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

export async function saveTransferRequest(transferRequest: TransferRequest): Promise<TransferRequest> {
    const connection = getConnection();
    const userRepository = connection.getRepository(TransferRequest);

    return await userRepository.save(transferRequest);
}

export async function updateTransferRequest(address: string, updatedEvent: Partial<TransferRequest>): Promise<any[]> {
    const connection = getConnection();
    const transferRequestRepository = connection.getRepository(TransferRequest);

    const tranferRequests = await transferRequestRepository.find({ where: { ['userAddress']: address } });
    if (!tranferRequests) {
        throw new EventNotFound('TransferRequest not present in database')
    }
    const updatedRequest = Object.assign(tranferRequests, updatedEvent);
    await transferRequestRepository.save(updatedRequest);
    return updatedRequest;
}