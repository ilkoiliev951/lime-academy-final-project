import process from "process";
import secrets from './../../secrets.json'
import {EVMBridge} from "../../typechain-types";

const config = require('./../../config.json')
const utils = require('./../contract-interaction-cli/utils/contractInteractionUtils')

async function createERCTokens () {
    // Create Generic Token on Source
    const sourceContract: EVMBridge = await getSourceContract();
    const genericTx = await sourceContract.createToken('Generic Token 1', 'GTT', 'generic')
    await genericTx.wait()
    console.log(genericTx)

    // Create Wrapped Token on Target
    const targetContract: EVMBridge = await getTargetContract();
    const targetTx = await targetContract.createToken('Wrapped Token 1', 'WTT', 'wrapped')
    await targetTx.wait()
    console.log(targetTx)
}

async function getSourceContract (): Promise<EVMBridge> {
    const sourceProvider = await utils.getProvider(true)
    const wallet = await utils.getWallet(secrets.PRIVATE_KEY, sourceProvider)
    return utils.getBridgeContract(wallet, config.PROJECT_SETTINGS.BRIDGE_CONTRACT_SOURCE);
}

async function getTargetContract (): Promise<EVMBridge> {
    const targetProvider = await utils.getProvider(false)
    const wallet = await utils.getWallet(secrets.PRIVATE_KEY, targetProvider)
    return utils.getBridgeContract(wallet, config.PROJECT_SETTINGS.BRIDGE_CONTRACT_TARGET);
}

createERCTokens().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});