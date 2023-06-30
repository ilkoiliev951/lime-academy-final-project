import {BigNumber} from 'ethers';
import {transferFeeOnSource} from "../handlers/feeHandler";
const validator = require('./validatorInteraction')
const config = require('./../../../config.json')
const constants = require('./../utils/constants')
const signatureGenerator = require('../../utils/helpers/permitSignatureGenerator')
const interactionUtils = require('./../utils/contractInteractionUtils')
const contractAddress = config.PROJECT_SETTINGS.BRIDGE_CONTRACT_SOURCE;
const provider = interactionUtils.getProvider(config.PROJECT_SETTINGS.isSourceLocal)

export async function lockWithPermit(
    tokenSymbol: string,
    tokenAddress: string,
    amount: BigNumber,
    privateKey: string) {

    await transferFeeOnSource(privateKey, amount,tokenAddress);

    const wallet =  interactionUtils.getWallet(privateKey, provider);
    const userAddressPub = wallet.address;
    const bridgeContract = interactionUtils.getBridgeContract(wallet, contractAddress);
    const erc20Contract = interactionUtils.getGenericERC20Contract(wallet, tokenAddress);

    const {v,r,s} = signatureGenerator.generateERC20PermitSignature(
        wallet,
        erc20Contract.name(),
        '1',
        constants.SOURCE_CHAIN_ID,
        tokenAddress,
        userAddressPub,
        bridgeContract.address,
        erc20Contract.nonces(userAddressPub),
        constants.PERMIT_DEADLINE,
        amount
        )

    const lockTx = await bridgeContract.lock(
        userAddressPub,
        tokenAddress,
        tokenSymbol,
        amount,
        constants.PERMIT_DEADLINE,
        v,
        r,
        s
    )
    await lockTx.wait()

    const transactionComplete = await interactionUtils.transactionIsIncludedInBlock(provider, lockTx.hash)
    if (transactionComplete) {
        await validator.updateUserBalanceRequest(tokenSymbol, tokenAddress, amount, wallet.address)
        printTransactionOutput(lockTx)
    }
}

export async function release(
    tokenAddress: string,
    tokenSymbol: string,
    amount: BigNumber,
    privateKey: string) {

    const wallet = interactionUtils.getWallet(privateKey, provider);
    await validator.validateReleaseRequest(tokenSymbol, tokenAddress, amount, wallet.address);
    const bridgeContract = interactionUtils.getBridgeContract(wallet, contractAddress);

    const releaseTx = await bridgeContract.release(amount, tokenAddress, tokenSymbol)
    await releaseTx.wait()

    const transactionComplete = await interactionUtils.transactionIsIncludedInBlock(provider, releaseTx.hash)
    if (transactionComplete) {
        await validator.updateUserBalanceRequest(tokenSymbol, tokenAddress, amount, wallet.address)
        printTransactionOutput(releaseTx)
    }
}

function printTransactionOutput(transaction: any) {
    console.info('Completed transaction output:');
    console.info(transaction);
}
