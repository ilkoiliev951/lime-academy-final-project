import {BigNumber, ethers} from "ethers";
import {BRIDGE_FEE_PERCENTAGE_MULTIPLIER} from "../utils/constants";
import {GenericERC20, WrappedERC20} from "../../../typechain-types";

const interactionUtils = require('./../utils/contractInteractionUtils')
const config = require('./../../../config.json')

export function calculateFee(transactionAmount: BigNumber) {
    return transactionAmount.mul(BigNumber.from(BRIDGE_FEE_PERCENTAGE_MULTIPLIER))
}

export async function transferFeeOnSource(privateKey: string, feeAmount: BigNumber, tokenAddress: string) {
    const provider = interactionUtils.getProvider(true);
    const wallet = interactionUtils.getWallet(privateKey, provider);
    const erc20: GenericERC20= interactionUtils.getGenericERC20Contract(wallet, tokenAddress);

    try {
        const tx = await erc20.transfer(config.PROJECT_SETTINGS.BRIDGE_CONTRACT_SOURCE, feeAmount);
        await tx.wait();
        console.log('Generic Token bridge fee transferred successfully!');
    } catch (error) {
        console.error('Error transferring tokens:', error);
    }
}

export async function transferFeeOnTarget(privateKey: string, feeAmount: BigNumber, tokenAddress: string) {
    const provider = interactionUtils.getProvider(false);
    const wallet = interactionUtils.getWallet(privateKey, provider);
    const werc20: WrappedERC20 = interactionUtils.getGenericERC20Contract(wallet, tokenAddress);

    try {
        const tx = await werc20.transfer(config.PROJECT_SETTINGS.BRIDGE_CONTRACT_SOURCE, feeAmount);
        await tx.wait();
        console.log('Wrapped Token bridge fee transferred successfully!');
    } catch (error) {
        console.error('Error transferring tokens:', error);
    }
}
