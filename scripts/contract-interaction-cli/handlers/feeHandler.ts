import {BigNumber, ethers} from "ethers";
import {BRIDGE_FEE_PERCENTAGE_MULTIPLIER} from "../utils/constants";
import secrets from "../../../secrets.json";

export function calculateFee(transactionAmount: BigNumber) {
    return transactionAmount.mul(BigNumber.from(BRIDGE_FEE_PERCENTAGE_MULTIPLIER))
}

export function transferFeeOnSource(privateKey: string, feeAmount: BigNumber) {

}

export function transferFeeOnTarget(privateKey: string, feeAmount: BigNumber) {

}



function getProvider(isLocalProvider: boolean) {
    if (isLocalProvider) {
        return new ethers.providers.JsonRpcProvider(
            "http://localhost:8545"
        );
    }
    return new ethers.providers.InfuraProvider(
        "sepolia",
        secrets.INFURA_KEY
    );
}
