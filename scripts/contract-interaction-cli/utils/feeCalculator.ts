import {BigNumber} from "ethers";
import {BRIDGE_FEE_PERCENTAGE_MULTIPLIER} from "./constants";


export function calculateFee(transactionAmount: BigNumber) {
    return transactionAmount.mul(BigNumber.from(BRIDGE_FEE_PERCENTAGE_MULTIPLIER))
}

export function transferFeeFromUserToContract(privateKey: string, amount: BigNumber) {
    // TODO: Fees can be kept in a separate wallet and not in the contract

}
