import {BigNumber} from "ethers";

const validator = require('./../data/dbValidator')

export async function getSourceBalance (
    operationType: string,
    txAmount: string,
    userAddress: string,
    tokenSymbol: string
) : Promise<BigNumber> {

    if (operationType == 'LOCK') {
        let sourceBalance = await validator.getUserBalanceBySymbol(userAddress, tokenSymbol);
        if (sourceBalance) {
            let source: BigNumber = getBigNumberFromString(sourceBalance.userBalanceSource)
            console.log('SWITCH: ' + source)
            let amount: BigNumber = getBigNumberFromString(txAmount);
            console.log('SWITCH: ' + amount)
            return source.add(amount)
        } else {
            return getBigNumberFromString(txAmount);
        }
    } else if (operationType == 'MINT' || operationType == 'BURN') {
        let sourceBalance = await validator.getUserBalanceBySymbol(userAddress, tokenSymbol);
        if (sourceBalance) {
            return getBigNumberFromString(sourceBalance.userBalanceSource);
        }
    } else if (operationType == 'RELEASE') {
        let sourceBalance = await validator.getUserBalanceBySymbol(userAddress, tokenSymbol);
        if (sourceBalance) {
            let source: BigNumber = getBigNumberFromString(sourceBalance.userBalanceSource);
            let amount: BigNumber = getBigNumberFromString(txAmount);
            return source.sub(amount);
        }
    }
}

export async function getTargetBalance (
    operationType: string,
    txAmount: string,
    userAddress: string,
    tokenSymbol: string): Promise<BigNumber> {

    if (operationType == 'LOCK') {
        let targetBalance = await validator.getUserBalanceBySymbol(userAddress, tokenSymbol);
        if (targetBalance) {
            return getBigNumberFromString(targetBalance.userBalanceTarget);
        } else {
            return getBigNumberFromString('0');
        }
    } else if (operationType == 'BURN') {
        let targetBalance = await validator.getUserBalanceBySymbol(userAddress, tokenSymbol);
        if (targetBalance) {
            let target = getBigNumberFromString(targetBalance.userBalanceTarget)
            let amount = getBigNumberFromString(txAmount)
            return target.sub(amount);
        }
    } else if (operationType == 'MINT') {
        let targetBalance = await validator.getUserBalanceBySymbol(userAddress, tokenSymbol);
        if (targetBalance) {
            let target = getBigNumberFromString(targetBalance.userBalanceTarget)
            let amount = getBigNumberFromString(txAmount)
            return target.add(amount);
        }
    } else  if ('RELEASE') {
        let targetBalance = await validator.getUserBalanceBySymbol(userAddress, tokenSymbol);
        if (targetBalance) {
            return getBigNumberFromString(targetBalance.userBalanceTarget);
        }
    }
}

function getBigNumberFromString (input: string): BigNumber {
    if (input=='0.00' || input=='0') {
        return BigNumber.from(0);
    }
    return BigNumber.from(removeDotAndZeros(input));
}

function removeDotAndZeros(input: string): string {
    for (let i = 0; i < input.length; i++) {
        if (input[i] === '.') {
            return input.slice(0, i);
        }
    }
    return input;
}