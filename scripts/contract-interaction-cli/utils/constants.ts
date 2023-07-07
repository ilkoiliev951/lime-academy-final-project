import {BigNumber, ethers} from "ethers";
const fs = require('fs')

export const COMMANDS = {
    LOCK:  'lock',
    CLAIM: 'claim',
    BURN: 'burn',
    RELEASE: 'release',
    LOGIN: 'login',
    LOGOUT: 'logout'
} as const;

type CommandKey = keyof typeof COMMANDS;

export const COMMAND_ELEMENT_COUNT_DICT: Record<CommandKey, number> = {
    LOCK: 4,
    CLAIM: 4, // stands for mint
    BURN: 4,
    RELEASE: 5,
    LOGIN: 0,
    LOGOUT: 1
};

export const SOURCE_CHAIN_ID = BigNumber.from(11155111);
export const TARGET_CHAIN_ID = BigNumber.from(5);

export const PERMIT_DEADLINE = ethers.constants.MaxUint256;

// URLs
export const VALIDATOR_BASE_URL = 'http://localhost:8082/api/validator/';
export const AUTH_BASE_URL = 'http://localhost:8082/'

// Logger
// export const LOGGER = new console.Console(fs.createWriteStream("cli.log"));
