import {BigNumber, ethers} from "ethers";
import {GenericERC20, WrappedERC20} from "../../../typechain-types";

const interactionUtils = require('./../utils/contractInteractionUtils')
const config = require('./../../../config.json')

export function calculateFee(transactionAmount: BigNumber) {
    console.log(transactionAmount)
    return transactionAmount.div(BigNumber.from(1000))
}

export async function transferFeeOnSource(wallet: any,  privateKey: string, feeAmount: BigNumber, tokenAddress: string) {
    const erc20: GenericERC20 = await interactionUtils.getGenericERC20Contract(wallet, tokenAddress);
    try {
        const tx = await erc20.transfer(config.PROJECT_SETTINGS.BRIDGE_CONTRACT_SOURCE, feeAmount);
        await tx.wait();
        console.log('Generic Token bridge fee transferred successfully!');
    } catch (error) {
        console.error('Error transferring tokens:', error);
    }
}

export async function transferFeeOnTarget(wallet: any, privateKey: string, feeAmount: BigNumber, tokenAddress: string) {
    const werc20: WrappedERC20 = interactionUtils.getWrappedERC20Contract(wallet, tokenAddress);
    try {
        const tx = await werc20.transfer(config.PROJECT_SETTINGS.BRIDGE_CONTRACT_TARGET, feeAmount);
        await tx.wait();
        console.log('Wrapped Token bridge fee transferred successfully!');
    } catch (error) {
        console.error('Error transferring tokens:', error);
    }
}
