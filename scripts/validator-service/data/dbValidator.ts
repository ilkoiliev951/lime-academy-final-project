import {getConnection} from "typeorm";
import {Token} from "../../entity/Token";

export async function validateNewToken(tokenSymbol, tokenName): Promise<boolean> {
    const connection = getConnection();
    const tokenRepository = connection.getRepository(Token);

    const queryBuilder = tokenRepository
        .createQueryBuilder('entity')
        .where('entity.tokenSymbol = :tokenSymbol', { tokenSymbol })
        .orWhere('entity.tokenName = :tokenName', { tokenName });

    const results = await queryBuilder.getMany();
    return results.length === 0;
}

export async function validateMint(tokenSymbol, tokenAddress, amount, userAddress) {
    // validate that user balance on source is >=
    // validate
}

export async function validateBurn(tokenSymbol, tokenAddress, amount, userAddress) {

}

export async function validateRelease(tokenSymbol, tokenAddress, amount, userAddress) {

}

export async function updateUserBalance(tokenSymbol, tokenAddress, amount, userAddress) {

}

function getUserBalanceOnSource () {

}

function getUserBalanceOnTarget () {

}





