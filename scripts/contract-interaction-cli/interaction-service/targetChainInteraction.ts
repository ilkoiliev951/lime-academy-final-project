import {BigNumber} from 'ethers';
import {transferFeeOnTarget} from "../handlers/feeHandler";
import {EVMBridge} from "../../../typechain-types";
import {MintRequestValidationFailed} from "../../utils/exceptions/MintRequestValidationFailed";
import {BurnRequestValidationFailed} from "../../utils/exceptions/BurnRequestValidationFailed";
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

    const p = await provider;
    const wallet = await interactionUtils.getWallet(privateKey, p);
    const userAddressPub = wallet.address;

    const validMintRequest = await validator.validateMintRequest(tokenSymbol, tokenAddress, amount.toString(), userAddressPub);
    if (validMintRequest) {
        const bridgeContract: EVMBridge = interactionUtils.getBridgeContract(wallet, contractAddress);

        const mintTx = await bridgeContract.mint(
            tokenSymbol,
            'Wrapped Token',
            tokenAddress,
            userAddressPub,
            amount
        )
        await mintTx.wait()

        const transactionComplete = await interactionUtils.transactionIsIncludedInBlock(p, mintTx.hash)
        if (transactionComplete) {
            await validator.updateUserBalanceRequest(wallet.address, amount.toString(), '', '',tokenSymbol, tokenAddress, false)
            printTransactionOutput(mintTx)
        }
    } else {
        throw new MintRequestValidationFailed('Invalid mint request. No corresponding lock event found.')
    }
}

export async function burnWithPermit(
    tokenSymbol: string,
    tokenAddress: string,
    amount: BigNumber,
    privateKey: string) {

    const p = await provider;
    const wallet = interactionUtils.getWallet(privateKey, provider);
    const validBurnRequest = await validator.validateBurnRequest(tokenSymbol, tokenAddress, amount.toString(), wallet.address);

    if (validBurnRequest) {
        await transferFeeOnTarget(wallet, privateKey, amount, tokenAddress);

        const userAddressPub = wallet.address;
        const bridgeContract = interactionUtils.getBridgeContract(wallet, contractAddress);
        const erc20Contract = interactionUtils.getGenericERC20Contract(wallet, tokenAddress);

        const {v, r, s} = signatureGenerator.generateERC20PermitSignature(
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
            const userBalanceUpdated = await validator.updateUserBalanceRequest(userAddressPub, amount.toString(), '', '', tokenSymbol, tokenAddress, false)
            if (userBalanceUpdated) {
                console.log('Updated user bridge balance')
                printTransactionOutput(burnTx)
            }
        }
    } else {
        throw new BurnRequestValidationFailed('Invalid burn request. Requested amount exceeds minted amount ')
    }
}

function printTransactionOutput(transaction: any) {
    console.info('Completed transaction output:');
    console.info(transaction);
}
