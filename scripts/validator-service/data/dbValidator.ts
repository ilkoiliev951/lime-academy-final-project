import {Token} from "../../entity/Token";
import {User} from "../../entity/User";
import {EntityNotFoundException} from "../../utils/exceptions/EntityNotFound";
import {BigNumber} from "ethers";
import {TokensBurnt} from "../../entity/TokensBurnt";
import {TokensLocked} from "../../entity/TokensLocked";
import {AppDataSource} from "./dataSource";
import {TokenBalance} from "../../entity/TokenBalance";


export async function connect () {
    try {
        await AppDataSource.connect()
    } catch (e) {
        console.log(e)
    }
}

export async function validateNewToken(tokenSymbol: string, tokenName: string) {
    // const tokens = await AppDataSource.manager
    //     .createQueryBuilder(Token, 'token')
    //     .where('token.tokenSymbol = :tokenSymbol', { tokenSymbol })
    //     .orWhere('token.tokenName = :tokenName', { tokenName });
    //
    // const results = await tokens.getMany();
    // return results.length === 0;
}

export async function validateMint(tokenSymbol: string, tokenSymbolTarget: string, tokenAddress: string, amount: string, userAddress: string) {
    // // validate that user balance on source is enough for the transaction
    // const userBalance: BigNumber = await getUserBalanceBySymbol(userAddress, tokenSymbol);
    // if (userBalance.lt(amount)) {
    //     // log
    //     return false;
    // }
    //
    // const userLockEvents = await getActiveLockEvent(userAddress, tokenSymbol, amount.toString())
    // if (userLockEvents) {
    //     return true;
    // }
    // return false;
}

export async function validateBurn(tokenSymbol: string, tokenAddress: string, amount: string, userAddress: string) {
//     // validate that user balance on source is enough for the transaction
//     const userBalance: BigNumber = await getUserBalanceBySymbol(userAddress, tokenSymbol);
//     if (userBalance.lt(amount)) {
//         // log
//         return false;
//     }
//     return true;
// }
}

async function validateRelease(tokenSymbol: string, tokenAddress: string, amount: string, userAddress: string) {
    // // validate that user balance on source is enough for the transaction
    // const userBalance: BigNumber = await getUserBalanceBySymbol(userAddress, tokenSymbol);
    // if (userBalance.lt(amount)) {
    //     // log
    //     return false;
    // }
    //
    // const userLockEvents = await getActiveBurnEvent(userAddress, tokenSymbol, amount.toString())
    // if (userLockEvents) {
    //     return true;
    // }
    // return false;
}

 async function getUserBalanceBySymbol(address: string, tokenSymbol: string) {
    const user =  await AppDataSource.manager
        .createQueryBuilder(User, "user")
        .where("user.userAddress = :address", { address: address })
        .leftJoinAndSelect("user.balances", "balances")
        .where("balances.tokenSymbol = :tokenSymbol", {tokenSymbol: tokenSymbol})
        .getOne();

    if (user) {
       // return BigNumber.from(user.balances[0].userBridgeBalance);
    }
    //throw new EntityNotFoundException('User with the given address was not found.')
}

 async function getActiveLockEvent(address: string, tokenSymbol: string, amount: string) {
    // const activeLockEvents =  await AppDataSource.manager
    //     .createQueryBuilder(TokensLocked, "event")
    //     .where("event.userAddress = :address", { address: address })
    //     .andWhere("event.tokenSymbol = :tokenSymbol", {tokenSymbol: tokenSymbol})
    //     .andWhere("event.amount =: amount", {amount: amount})
    //     .andWhere('event.claimedOnTarget IS NOT TRUE')
    //     .getMany();
    //
    // if (activeLockEvents) {
    //     // If there are more than one active events with the same amount,
    //     // we'll take the first - it is enough to validate the call
    //     return activeLockEvents[0];
    // }
    // throw new EntityNotFoundException('User with the given address was not found.')
}

async function getActiveBurnEvent(address: string, tokenSymbol: string, amount: string) {
    // const activeBurntEvents = await AppDataSource.manager
    //     .createQueryBuilder(TokensBurnt, "event")
    //     .where("event.userAddress = :address", { address: address })
    //     .andWhere("event.tokenSymbol = :tokenSymbol", {tokenSymbol: tokenSymbol})
    //     .andWhere("event.amount =: amount", {amount: amount})
    //     .andWhere('event.releasedOnSource IS NOT TRUE')
    //     .getMany();
    //
    // if (activeBurntEvents) {
    //     // If there are more than one active events with the same amount,
    //     // we'll take the first - it is enough to validate the call
    //     return activeBurntEvents[0];
    // }
    // throw new EntityNotFoundException('User with the given address was not found.')
}

export async function updateUserBalance(
    userAddress: string,
    tokenSymbolSource: string,
    tokenSymbolTarget: string,
    sourceBalance,
    targetBalance
     ) {

    const user = await AppDataSource.manager.findOneBy(User, {userAddress: userAddress})

    if (user) {

    } else {
        // create a new user with a balance
        let newBalance = new TokenBalance(userAddress, tokenSymbolSource, tokenSymbolSource, sourceBalance, targetBalance)
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





