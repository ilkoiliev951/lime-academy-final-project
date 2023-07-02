import {EVMBridge} from "../../typechain-types";

const interactionUtils = require('./../contract-interaction-cli/utils/contractInteractionUtils')
const config = require('./config/config.json')

export async function updateUserBalanceOnChain (
    userAddress,
    tokenSymbolSource,
    tokenBalanceSource,
    tokenSymbolTarget,
    tokenBalanceTarget,
    ) {

    const updatedOnSource = await updateBalanceOnSource(userAddress, tokenSymbolSource, tokenBalanceTarget, tokenBalanceSource)
    const updatedOnTarget = await updateBalanceOnTarget(userAddress, tokenSymbolTarget, tokenBalanceTarget, tokenBalanceSource)

    console.log('Updated balance on chain for user with address: ' + userAddress)
    return (updatedOnSource && updatedOnTarget);
}

export async function updateBalanceOnSource (userAddress, tokenSymbol, balanceTarget, balanceSource) {
    const provider = await interactionUtils.getProvider(true);
    const wallet =  await interactionUtils.getWallet(config.SETTINGS.ownerKey, provider);
    const bridgeContractSource: EVMBridge = await interactionUtils.getBridgeContract(wallet,  config.SETTINGS.BRIDGE_CONTRACT_SOURCE);
    try {
        const updateTx = await bridgeContractSource.updateUserBridgeBalance(userAddress, balanceSource, balanceTarget, tokenSymbol)
        await updateTx.wait()

        return true;
    } catch (e) {
        console.error(e)
        return false;
    }
}

export async function updateBalanceOnTarget(userAddress, tokenSymbol, balanceTarget, balanceSource) {
    const provider = await interactionUtils.getProvider(false);
    const wallet =  await interactionUtils.getWallet(config.SETTINGS.ownerKey, provider);
    const bridgeContractTarget: EVMBridge = await interactionUtils.getBridgeContract(wallet, config.SETTINGS.BRIDGE_CONTRACT_TARGET);

    try {
        const updateTx = await bridgeContractTarget.updateUserBridgeBalance(userAddress, balanceSource, balanceTarget, tokenSymbol)
        await updateTx.wait()

        return true;
    } catch (e) {
        console.error(e)
        return false;
    }
}

