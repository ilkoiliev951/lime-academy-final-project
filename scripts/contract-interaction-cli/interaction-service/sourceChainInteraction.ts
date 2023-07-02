import {BigNumber} from 'ethers';
import {calculateFee, transferFeeOnSource} from "../handlers/feeHandler";
import {EVMBridge, GenericERC20} from "../../../typechain-types";
import {TransactionValidationFailed} from "../../utils/exceptions/TransactionValidationFailed";
const validator = require('./validatorInteraction')
const config = require('./../../../config.json')
const constants = require('./../utils/constants')
const signatureGenerator = require('../../utils/helpers/permitSignatureGenerator')
const interactionUtils = require('./../utils/contractInteractionUtils')
const contractAddress = config.PROJECT_SETTINGS.BRIDGE_CONTRACT_SOURCE;
const providerPromise = interactionUtils.getProvider(true)

export async function lockWithPermit(
    tokenSymbol: string,
    tokenAddress: string,
    amount: BigNumber,
    privateKey: string) {

    const provider = await providerPromise;
    const wallet =  await interactionUtils.getWallet(privateKey, provider);

    await transferFeeOnSource(wallet, privateKey, calculateFee(amount), tokenAddress);

    const userAddressPub = wallet.address;
    const bridgeContract: EVMBridge = await interactionUtils.getBridgeContract(wallet, contractAddress);
    const erc20Contract: GenericERC20 = await interactionUtils.getGenericERC20Contract(wallet, tokenAddress);

    const {v,r,s} = await signatureGenerator.generateERC20PermitSignature(
        wallet,
        await erc20Contract.name(),
        '1',
        constants.SOURCE_CHAIN_ID,
        tokenAddress,
        userAddressPub,
        bridgeContract.address,
        await erc20Contract.nonces(userAddressPub),
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
        await validator.updateUserBalanceRequest(wallet.address, amount.toString(), tokenSymbol, tokenAddress, '', '',  true)
        printTransactionOutput(lockTx)
    } else {
        throw new TransactionValidationFailed('Failed to validate, that transaction was included in block')
    }
}

export async function release(
    tokenAddress: string,
    tokenSymbol: string,
    amount: BigNumber,
    privateKey: string) {

    const provider = await providerPromise;

    const wallet = interactionUtils.getWallet(privateKey, provider);

    await validator.validateReleaseRequest(tokenSymbol, tokenAddress, amount, wallet.address);
    const bridgeContract = interactionUtils.getBridgeContract(wallet, contractAddress);

    const releaseTx = await bridgeContract.release(amount, tokenAddress, tokenSymbol)
    await releaseTx.wait()

    const transactionComplete = await interactionUtils.transactionIsIncludedInBlock(provider, releaseTx.hash)
    if (transactionComplete) {
        await validator.updateUserBalanceRequest(wallet.address, tokenSymbol, tokenAddress, '', '',  true)
        printTransactionOutput(releaseTx)
    }
}

function printTransactionOutput(transaction: any) {
    console.info('Completed transaction output:');
    console.info(transaction);
}