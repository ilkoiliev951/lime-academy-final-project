import Web3 from "web3";
import secrets from '../../../secrets.json';
import {LOGGER} from "../utils/constants";

// Purpose of the function is
export async function calculateApproximateGasPriceInETH(network: string, gasLimit?: number) {
    let currentGasPrice: string = await getCurrentGasPriceInETH(network);
    if (gasLimit === null ||
        gasLimit === undefined ||
        gasLimit<210000) {
        gasLimit = 21000
    }

    return gasLimit * Number(currentGasPrice);
}

async function getCurrentGasPriceInETH (network: string) {
    let web3;
    if (network==='sepolia') {
        web3 = new Web3(new Web3.providers.WebsocketProvider(secrets.INFURA_SEPOLIA_SOCKET_URL));
    } else {
        web3 = new Web3(new Web3.providers.WebsocketProvider(secrets.INFURA_GOERLI_SOCKET_URL));
    }

    const result = await web3.eth.getGasPrice();
    return Web3.utils.fromWei(result);
}