import {COMMANDS, COMMAND_ELEMENT_COUNT_DICT} from "./utils/constants"
import {MissingArgumentsException} from './../utils/exceptions/MissingArgumentsException'
import {InvalidCommandInputException} from './../utils/exceptions/InvalidCommandInputException'
import {lockWithPermit, release} from "./interaction-service/sourceChainInteraction"
import {burnWithPermit, mint} from "./interaction-service/targetChainInteraction"
import {BigNumber} from "ethers";

const process = require('process');
const ethers = require('ethers');

export async function main() {
    let mainCommand: string = process.argv[2];
    let userPrivateKey: string = process.argv[3];

    if (isNullUndefined(mainCommand)) {
        throw new InvalidCommandInputException("Invalid main command. Call the script with the help argument to list available options.")
    }

    if (isNullUndefined(userPrivateKey) || !isValidPrivateKey(userPrivateKey)) {
        throw new InvalidCommandInputException("Invalid wallet private key.")
    }

    switch (mainCommand) {
        case COMMANDS.LOCK:
            if (!argumentsAreMissing(COMMAND_ELEMENT_COUNT_DICT.LOCK)) {
                let tokenSymbol  = process.argv[4];
                let tokenAddress = process.argv[5];
                let amount = BigNumber.from(process.argv[6]);
                await lockWithPermit(tokenSymbol, tokenAddress, amount, userPrivateKey)
            }
            break;
        case COMMANDS.CLAIM:
            if (!argumentsAreMissing(COMMAND_ELEMENT_COUNT_DICT.CLAIM)) {
                let tokenSymbol = process.argv[4];
                let tokenAddress = process.argv[5];
                let amount = BigNumber.from(process.argv[6])
                await mint(tokenSymbol, tokenAddress, amount,  userPrivateKey)
            }
            break;
        case COMMANDS.BURN:
            if (!argumentsAreMissing(COMMAND_ELEMENT_COUNT_DICT.BURN)) {
                let tokenSymbol = process.argv[4];
                let tokenAddress = process.argv[5];
                let amount =  BigNumber.from(process.argv[5]);
                await burnWithPermit(tokenSymbol,tokenAddress, amount, userPrivateKey)
            }
            break;
        case COMMANDS.RELEASE:
            if (!argumentsAreMissing(COMMAND_ELEMENT_COUNT_DICT.RELEASE)) {
                let tokenSymbol = process.argv[4];
                let tokenAddress = process.argv[5];
                let amount = BigNumber.from(process.argv[6]);
                await release(tokenAddress, tokenSymbol, amount, userPrivateKey)
            }
            break;
        default:
            printHelpOptions();
            return;
    }
}

function isNullUndefined(input: any) {
    return input == null || input == undefined;
}

function argumentsAreMissing(requiredArgumentArrayLength: number) {
    let argumentsAreMissing = process.argv.length < requiredArgumentArrayLength;
    if (argumentsAreMissing) {
        printHelpOptions()
        throw new MissingArgumentsException("You haven't passed all required arguments for this function");
    }
    return false;
}

function isValidPrivateKey(privateKey: string): boolean {
    try {
        const wallet = new ethers.Wallet(privateKey);
        return wallet != null;
    } catch (error) {
        console.error(error);
        return false;
    }
}

function printHelpOptions() {
    console.log('=== Available commands === \n')
    console.log('lock : Mandatory arguments: --  \n')
    console.log('claim : Mandatory arguments: --  \n')
    console.log('burn: Mandatory arguments: bookId \n')
    console.log('release : Mandatory arguments: bookId \n')
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});