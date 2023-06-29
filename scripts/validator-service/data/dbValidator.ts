import {getConnection, getManager} from "typeorm";
import {Token} from "../../entity/Token";
import {User} from "../../entity/User";
import {EntityNotFoundException} from "../../utils/exceptions/EntityNotFound";
import {BigNumber} from "ethers";
import {TokensBurnt} from "../../entity/TokensBurnt";
import {TokensLocked} from "../../entity/TokensLocked";

export async function validateNewToken(tokenSymbol, tokenName): Promise<boolean> {
    const connection = getConnection();
    const tokenRepository = connection.getRepository(Token);

    const tokens = await tokenRepository
        .createQueryBuilder('token')
        .where('token.tokenSymbol = :tokenSymbol', { tokenSymbol })
        .orWhere('token.tokenName = :tokenName', { tokenName });

    const results = await tokens.getMany();
    return results.length === 0;
}

export async function validateMint(tokenSymbol, tokenSymbolTarget, tokenAddress, amount, userAddress) {
    // validate that user balance on source is enough for the transaction
    const userBalance: BigNumber = await getUserBalanceBySymbol(userAddress, tokenSymbol);
    if (userBalance.lt(amount)) {
        // log
        return false;
    }

    const userLockEvents = await getActiveLockEvent(userAddress, tokenSymbol, amount.toString())
    if (userLockEvents.length > 0) {
        return true;
    }
    return false;
}

export async function validateBurn(tokenSymbol, tokenAddress, amount, userAddress) {
    // validate that user balance on source is enough for the transaction
    const userBalance: BigNumber = await getUserBalanceBySymbol(userAddress, tokenSymbol);
    if (userBalance.lt(amount)) {
        // log
        return false;
    }
    return true;
}

export async function validateRelease(tokenSymbol, tokenAddress, amount, userAddress) {
    // validate that user balance on source is enough for the transaction
    const userBalance: BigNumber = await getUserBalanceBySymbol(userAddress, tokenSymbol);
    if (userBalance.lt(amount)) {
        // log
        return false;
    }

    const userLockEvents = await getActiveBurnEvent(userAddress, tokenSymbol, amount.toString())
    if (userLockEvents.length > 0) {
        return true;
    }
    return false;
}

async function getUserBalanceBySymbol(address: string, tokenSymbol: string) {
    const user = await getManager()
        .createQueryBuilder(User, "user")
        .where("user.userAddress = :address", { address: address })
        .leftJoinAndSelect("user.balances", "balances")
        .where("balances.tokenSymbol = :tokenSymbol", {tokenSymbol: tokenSymbol})
        .getOne();

    if (user) {
        return BigNumber.from(user.balances[0].userBridgeBalance);
    }
    throw new EntityNotFoundException('User with the given address was not found.')
}

async function getActiveLockEvent(address: string, tokenSymbol: string, amount: string) {
    const activeLockEvents = await getManager()
        .createQueryBuilder(TokensLocked, "event")
        .where("event.userAddress = :address", { address: address })
        .andWhere("event.tokenSymbol = :tokenSymbol", {tokenSymbol: tokenSymbol})
        .andWhere("event.amount =: amount", {amount: amount})
        .andWhere('event.claimedOnTarget IS NOT TRUE')
        .getMany();

    if (activeLockEvents) {
        // If there are more than one active events with the same amount,
        // we'll take the first - it is enough to validate the call
        return activeLockEvents[0];
    }
    throw new EntityNotFoundException('User with the given address was not found.')
}

async function getActiveBurnEvent(address: string, tokenSymbol: string, amount: string) {
    const activeBurntEvents = await getManager()
        .createQueryBuilder(TokensBurnt, "event")
        .where("event.userAddress = :address", { address: address })
        .andWhere("event.tokenSymbol = :tokenSymbol", {tokenSymbol: tokenSymbol})
        .andWhere("event.amount =: amount", {amount: amount})
        .andWhere('event.releasedOnSource IS NOT TRUE')
        .getMany();

    if (activeBurntEvents) {
        // If there are more than one active events with the same amount,
        // we'll take the first - it is enough to validate the call
        return activeBurntEvents[0];
    }
    throw new EntityNotFoundException('User with the given address was not found.')
}

export async function updateUserBalance(tokenSymbol, amount,  userAddress) {

}





