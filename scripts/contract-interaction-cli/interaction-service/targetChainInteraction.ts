import {BigNumber} from 'ethers';
import {transferFeeOnTarget} from "../handlers/feeHandler";
const config = require('./../../../config.json')
const constants = require('./../utils/constants')
const signatureGenerator = require('../../utils/helpers/permitSignatureGenerator')
const interactionUtils = require('./../utils/contractInteractionUtils')
const contractAddress = config.PROJECT_SETTINGS.BRIDGE_CONTRACT_TARGET;
const provider = interactionUtils.getProvider(false)
const validator = require('./validatorInteraction')

export async function mint (
    tokenSymbol: string,
    tokenAddress: string,
    amount: BigNumber,
    privateKey: string) {
    const wallet = interactionUtils.getWallet(privateKey, provider);
    const userAddressPub = wallet.getAddress();
    await validator.validateMintRequest(tokenSymbol, tokenAddress, amount, userAddressPub);
    const bridgeContract = interactionUtils.getBridgeContract(wallet, contractAddress);

    const mintTx = await bridgeContract.mint(
        tokenSymbol,
        tokenAddress,
        userAddressPub,
        amount
    )
    await mintTx.wait()

    const transactionComplete = await interactionUtils.transactionIsIncludedInBlock(provider, mintTx.hash)
    if (transactionComplete) {
        await validator.updateUserBalanceRequest(tokenSymbol, tokenAddress, amount, wallet.address)
        printTransactionOutput(mintTx)
    }
}

export async function burnWithPermit(
    tokenSymbol: string,
    tokenAddress: string,
    amount: BigNumber,
    privateKey: string) {
    const wallet = interactionUtils.getWallet(privateKey, provider);
    await transferFeeOnTarget(wallet, privateKey, amount, tokenAddress);
    await validator.validateBurnRequest(tokenSymbol, tokenAddress, amount, wallet.address);

    const userAddressPub = wallet.getAddress();
    const bridgeContract = interactionUtils.getBridgeContract(wallet, contractAddress);
    const erc20Contract = interactionUtils.getGenericERC20Contract(wallet, tokenAddress);

    const {v,r,s} = signatureGenerator.generateERC20PermitSignature(
        wallet,
        erc20Contract.name(),
        '1',
        constants.TARGET_CHAIN_ID,
        tokenAddress,
        userAddressPub,
        bridgeContract.address,
        erc20Contract.nonces(userAddressPub),
        constants.PERMIT_DEADLINE,
        amount
    )

    const burnTx = await bridgeContract.burnWithPermit(
        tokenAddress,
        userAddressPub,
        amount,
        constants.PERMIT_DEADLINE,
        v,
        r,
        s
    )
    await burnTx.wait()

    const transactionComplete = await interactionUtils.transactionIsIncludedInBlock(provider, burnTx.hash)
    if (transactionComplete) {
        await validator.updateUserBalanceRequest(tokenSymbol, tokenAddress, amount, wallet.address)
        printTransactionOutput(burnTx)
    }
}

function printTransactionOutput(transaction: any) {
    console.info('Completed transaction output:');
    console.info(transaction);
}
