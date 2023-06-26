import {BigNumber} from 'ethers';
const config = require('./../../../config.json')
const constants = require('./../utils/constants')
const signatureGenerator = require('./../../utils/permitSignatureGenerator')
const validator = require('./../validator-service/validator')
const interactionUtils = require('./../utils/contractInteractionUtils')
const contractAddress = config.PROJECT_SETTINGS.BRIDGE_CONTRACT_TARGET;
const provider = interactionUtils.getProvider(config.PROJECT_SETTINGS.isTargetLocal)

export async function createToken(
    privateKey: string,
    tokenName: string,
    tokenSymbol: string) {
    const wallet = interactionUtils.getWallet(privateKey, provider);
    const bridgeContract = interactionUtils.getBridgeContract(wallet, contractAddress);

    const createTokenTx = await bridgeContract.createToken(tokenName, tokenSymbol, 'wrapped');
    await createTokenTx.wait()

    printTransactionOutput(createTokenTx)
}

export async function mint (
    tokenSymbol: string,
    tokenAddress: string,
    amount: BigNumber,
    privateKey: string) {


    // DB checks
    const wallet = interactionUtils.getWallet(privateKey, provider);
    const userAddressPub = wallet.getAddress();
    const bridgeContract = interactionUtils.getBridgeContract(wallet, contractAddress);

    const mintTx = await bridgeContract.mint(
        tokenSymbol,
        tokenAddress,
        userAddressPub,
        amount
    )

    await mintTx.wait()
}

export async function burnWithPermit(
    tokenSymbol: string,
    tokenAddress: string,
    amount: BigNumber,
    privateKey: string) {

    const wallet = interactionUtils.getWallet(privateKey, provider);
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

    printTransactionOutput(burnTx)
}

function printTransactionOutput(transaction: any) {
    console.info('Completed transaction output:');
    console.info(transaction);
}

function printPreTransactionEstimations(feeEstimate: any, gasEstimate: any) {
    console.info('Completed transaction output:');
}
