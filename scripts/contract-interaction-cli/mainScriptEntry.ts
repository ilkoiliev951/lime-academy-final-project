import {COMMANDS, COMMAND_ELEMENT_COUNT_DICT} from "./utils/constants"
import {MissingArgumentsException} from './exceptions/MissingArgumentsException'
import {InvalidCommandInputException} from './exceptions/InvalidCommandInputException'
import {
    lock,
    release
} from "./interaction-service/sourceChainInteraction"

import {
    mint,
    burn
} from "./interaction-service/targetChainInteraction"
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
                let title = process.argv[4];
                let author = process.argv[5];
                let copiesCount = BigNumber.from(process.argv[6]);
                await createANewBook(title, author, copiesCount, userPrivateKey);
            }
            break;
        case COMMANDS.CLAIM:
            if (!argumentsAreMissing(COMMAND_ELEMENT_COUNT_DICT.CLAIM)) {
                let bookId = process.argv[4];
                let additionalCopiesCount = BigNumber.from(process.argv[5]);
                await addBookCopies(bookId, additionalCopiesCount, userPrivateKey);
            }
            break;
        case COMMANDS.BURN:
            if (!argumentsAreMissing(COMMAND_ELEMENT_COUNT_DICT.BURN)) {
                let bookId = process.argv[4];
                await borrowBook(bookId, userPrivateKey);
            }
            break;
        case COMMANDS.RELEASE:
            if (!argumentsAreMissing(COMMAND_ELEMENT_COUNT_DICT.RELEASE)) {
                let bookId = process.argv[4];
                await returnBook(bookId, userPrivateKey);
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
    console.log('add-new-book : Mandatory arguments: --  \n')
    console.log('add-new-book : Mandatory arguments: --  \n')
    console.log('borrow : Mandatory arguments: bookId \n')
    console.log('return : Mandatory arguments: bookId \n')
    console.log('get-all-available: Mandatory arguments: --  \n')
    console.log('get-book-borrower-history: Mandatory arguments: --  \n')
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});