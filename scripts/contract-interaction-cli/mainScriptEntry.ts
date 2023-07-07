import {COMMANDS, COMMAND_ELEMENT_COUNT_DICT} from "./utils/constants"
import {MissingArgumentsException} from './../utils/exceptions/MissingArgumentsException'
import {InvalidCommandInputException} from './../utils/exceptions/InvalidCommandInputException'
import {lockWithPermit, release} from "./interaction-service/sourceChainInteraction"
import {burnWithPermit, mint} from "./interaction-service/targetChainInteraction"
import {BigNumber} from "ethers";
import {signInWithEthereum} from "./utils/signInWithEthereum";

const secrets = require('./../../secrets.json')
const process = require('process');
const ethers = require('ethers');

export async function main() {
    let mainCommand: string = process.argv[2];
    let userPrivateKey: string = secrets.PRIVATE_KEY

    isNullUndefined(mainCommand)
    isNullUndefined(userPrivateKey)
    isValidPrivateKey(userPrivateKey)

    switch (mainCommand) {
        case COMMANDS.LOGIN:
            await signInWithEthereum(new ethers.Wallet(userPrivateKey))
        case COMMANDS.LOGOUT:
            await signOut(new ethers.Wallet(userPrivateKey))
        case COMMANDS.LOCK:
            if (!argumentsAreMissing(COMMAND_ELEMENT_COUNT_DICT.LOCK)) {
                let tokenSymbol  = process.argv[3];
                let tokenAddress = process.argv[4];
                let amount = BigNumber.from(process.argv[5]);
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
                let amount =  BigNumber.from(process.argv[6]);
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
    if (input == null || input == undefined) {
        throw new InvalidCommandInputException("Invalid main command. Call the script with the help argument to list available options.")
    }
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
        throw new InvalidCommandInputException("Invalid wallet private key.")
    }
}

function printHelpOptions() {
    console.log('=== Available commands === \n')
    console.log('lock : Mandatory arguments: privateKey tokenSymbol tokenAddress amount\n')
    console.log('claim : Mandatory arguments: privateKey tokenSymbol tokenAddress amount\n')
    console.log('burn: Mandatory arguments: privateKey tokenSymbol tokenAddress amount\n')
    console.log('release : Mandatory arguments: privateKey tokenSymbol tokenAddress amount\n')
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});