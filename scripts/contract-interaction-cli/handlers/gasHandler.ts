import {BigNumber} from "ethers";

export async function calculateMaxGasPriceInWEI(customGasLimit?: number ) {
    let currentGasPrice = await getCurrentGasPrice();
    if (customGasLimit===null ||
        customGasLimit === undefined ||
        customGasLimit<210000) {

    }

}

async function getCurrentGasPrice () {
}
