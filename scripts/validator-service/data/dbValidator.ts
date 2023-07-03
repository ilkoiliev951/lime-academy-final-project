import {Token} from "../../entity/Token";
import {User} from "../../entity/User";
import {EntityNotFoundException} from "../../utils/exceptions/EntityNotFound";
import {TokensLocked} from "../../entity/TokensLocked";
import {AppDataSource} from "./dataSource";
import {TokenBalance} from "../../entity/TokenBalance";
import {TokensBurnt} from "../../entity/TokensBurnt";
import {BigNumber} from "ethers";

export async function connect () {
    try {
        await AppDataSource.connect()
    } catch (e) {
        console.log(e)
    }
}

export async function validateMint(tokenSymbol: string, tokenAddress: string, amount: string, userAddress: string) {
    const correspondingToken = await getTokenOnOtherChain(tokenSymbol)
    if (correspondingToken) {
        const userLockEvents = await getActiveLockEvent(userAddress, correspondingToken.tokenSymbol, amount)
        if (userLockEvents.length!==0) {
            return true;
        }
    }
    return false;
}

export async function validateBurn(tokenSymbol: string, tokenAddress: string, amount: string, userAddress: string) {
    const userBalance = await getUserBalanceBySymbol(userAddress, tokenSymbol);
    if (userBalance.userBalanceTarget) {
        const balance = userBalance.userBalanceTarget.toString().slice(0, -3)
        console.log(balance)
        const targetBalance = BigNumber.from(balance);
        if (BigNumber.from(amount).lt(targetBalance)) {
           return true;
        }
    }
    console.log('Requested burn amount exceeds minted amount')
    return false;
}

export async function validateRelease(tokenSymbol: string, tokenAddress: string, amount: string, userAddress: string) {
    const correspondingToken = await getTokenOnOtherChain(tokenSymbol)
    if (correspondingToken) {
        const userBurnEvents = await getActiveBurnEvent(userAddress, correspondingToken.tokenSymbol, amount)
        if (userBurnEvents.length!==0) {
            return true;
        }
    }
    return false;
}

async function getActiveLockEvent(address: string, tokenSymbol: string, amount: string) {
    const activeLockEvents =  await AppDataSource.manager
        .createQueryBuilder(TokensLocked, "event")
        .where("event.userAddress=:address", { address: address })
        .andWhere("event.tokenSymbol=:tokenSymbol", {tokenSymbol: tokenSymbol})
        .andWhere("event.amount=:amount", {amount: amount})
        .andWhere('event.claimedOnTarget IS NOT TRUE')
        .getMany();

    if (activeLockEvents) {
        // If there are more than one active events with the same amount,
        // we'll take the first - it is enough to validate the call
        return activeLockEvents;
    }
    return [];
}

 async function getUserBalanceBySymbol(address: string, tokenSymbol: string) {
     const userBalance = await AppDataSource.manager
         .createQueryBuilder(TokenBalance, "balance")
         .where("balance.userAddress = :address", { address: address })
         .andWhere(
             "balance.tokenSymbolSource = :tokenSymbol OR balance.tokenSymbolTarget = :tokenSymbol",
             { tokenSymbol: tokenSymbol }
         )
         .getOne();

     console.log(userBalance)

     if (userBalance) {
        return userBalance;
    }
    throw new EntityNotFoundException('User or event with the given address was not found.')
}

async function getActiveBurnEvent(address: string, tokenSymbol: string, amount: string) {
    const activeBurntEvents = await AppDataSource.manager
        .createQueryBuilder(TokensBurnt, "event")
        .where("event.userAddress=:address", { address: address })
        .andWhere("event.tokenSymbol =:tokenSymbol", {tokenSymbol: tokenSymbol})
        .andWhere("event.amount=:amount", {amount: amount})
        .andWhere('event.releasedOnSource IS NOT TRUE')
        .getMany();

    if (activeBurntEvents) {
        // If there are more than one active events with the same amount,
        // we'll take the first - it is enough to validate the call
        return activeBurntEvents;
    }
    throw new EntityNotFoundException('User or event with the given address was not found.')
}

export async function updateUserBalance(
    userAddress: string,
    tokenSymbolSource: string,
    tokenSymbolTarget: string,
    sourceBalance,
    targetBalance
     ) {

    const userRepository = AppDataSource.getRepository(User)
    const user = await userRepository.findOne({
        relations: {
            balances: true,
        },
    })

    if (user) {
        const balances = user.balances;
        for (const balance of balances) {
            if (balance.tokenSymbolSource === tokenSymbolSource) {

                return;
            }
        }
        let newBalance = new TokenBalance(userAddress, tokenSymbolSource, tokenSymbolTarget, sourceBalance, targetBalance)
        await AppDataSource.manager.save(newBalance)

        user.balances.push(newBalance)
        await AppDataSource.manager.save(user)

    } else {
        let newBalance = new TokenBalance(userAddress, tokenSymbolSource, tokenSymbolTarget, sourceBalance, targetBalance)
        await AppDataSource.manager.save(newBalance)

        const user = new User(userAddress, [newBalance])
        await AppDataSource.manager.save(user)
    }

    return false;
}

export async function getTokenOnOtherChain (symbol: string) {
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





