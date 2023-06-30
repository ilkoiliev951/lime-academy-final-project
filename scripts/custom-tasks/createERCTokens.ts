import process from "process";
import secrets from './../../secrets.json'
import {EVMBridge} from "../../typechain-types";
import {BigNumber} from "ethers";

const config = require('./../../config.json')
const utils = require('./../contract-interaction-cli/utils/contractInteractionUtils')

async function createERCTokens () {
    // Create Generic ERC20 on source
    const sourceContract: EVMBridge = await getSourceContract();
    // const genericTx = await sourceContract.createToken('Generic Token 11', 'GTT11', 'generic')
    // await genericTx.wait()

    const gTokenAddress = await sourceContract.tokens('GTT11');
    console.log("Generic Token Address Contract: " + gTokenAddress.toString())

    // Mint initial generic amount to user wallet
    for (let i = 0; i < 3; i++) {
        const mintInitialTx = await sourceContract.mintInitialGenericTokenAmount('GTT11', secrets.PUBLIC_KEY, gTokenAddress,BigNumber.from(3000000000000000))
        await mintInitialTx.wait()
    }

    //
    // // Create Wrapped ERC20 on Target
    //  const targetContract: EVMBridge = await getTargetContract();
    // const targetTx = await targetContract.createToken('Wrapped Token 11', 'WTT11', 'wrapped')
    // await targetTx.wait()
    //
    // const wTokenAddress = await targetContract.tokens('WTT11');
    // console.log("Wrapped Token Address Contract: " + wTokenAddress.toString())
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