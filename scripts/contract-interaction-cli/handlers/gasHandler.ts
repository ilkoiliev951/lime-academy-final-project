import {BigNumber} from "ethers";
import Web3 from "web3";
import secrets from '../../../secrets.json';
import{LOGGER} from "../utils/constants";

// Purpose of the function is
export async function calculateApproximateGasPriceInETH(gasLimit?: number) {
    let currentGasPrice = await getCurrentGasPriceInETH();
    if (gasLimit === null ||
        gasLimit === undefined ||
        gasLimit<210000) {
        gasLimit = 21000
    }

    return gasLimit * currentGasPrice;
}

async function getCurrentGasPriceInETH () {
    // Get current gas.
    const web3 = new Web3(new Web3.providers.WebsocketProvider(secrets.INFURA_SEPOLIA_SOCKET_URL));
    // Fetch the current gas price from the network
    let currentGweiPrice = web3.eth.getGasPrice()
        .then((result) => {
            // Convert the result from Wei to Gwei
            return Web3.utils.fromWei(result);
        })
        .catch((error) => {
            LOGGER.error(`Error fetching gas price: ${error}`);
        });
    return currentGweiPrice;
}