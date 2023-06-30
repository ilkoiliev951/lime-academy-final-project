import {BigNumber, ethers, Wallet} from "ethers";
import secrets from "../../../secrets.json";
import {calculateApproximateGasPriceInETH} from "../handlers/gasHandler";
import {calculateFee} from "../handlers/feeHandler";
import {LOGGER} from "./constants";

const bridge = require("./../../../artifacts/contracts/EVMBridge.sol/EVMBridge.json");
const genericERC20 = require("../../../artifacts/contracts/GenericERC20.sol/GenericERC20.json");
const wrappedERC20 = require("../../../artifacts/contracts/WrappedERC20.sol/WrappedERC20.json");

export async function getWallet(privateKey: string, provider:any) {
    return new ethers.Wallet(
        privateKey,
        provider
    );
}

export async function getProvider(isSource: boolean) {
    if (isSource) {
        return new ethers.providers.InfuraProvider(
            "sepolia",
            secrets.INFURA_KEY
        );
    }
    return new ethers.providers.InfuraProvider(
        "goerli",
        secrets.INFURA_KEY
    );
}

export function getBridgeContract(wallet: Wallet, contractAddress:any) {
    return new ethers.Contract(
        contractAddress,
        bridge.abi,
        wallet
    );
}

export function getGenericERC20Contract(wallet: Wallet, tokenContractAddress: string) {
    return new ethers.Contract(
        tokenContractAddress,
        genericERC20.abi,
        wallet
    );
}

export function getWrappedERC20Contract(wallet: Wallet, tokenContractAddress: string) {
    return new ethers.Contract(
        tokenContractAddress,
        wrappedERC20.abi,
        wallet
    );
}

export async function transactionIsIncludedInBlock (provider: any, txHash: string) {
    let included = false;
    let retryCount = 0;
    while (!included || retryCount<4) {
        try {
            const receipt = await provider.getTransactionReceipt(txHash);
            if (receipt && receipt.blockNumber) {
                LOGGER.info('Transaction is confirmed and included in block', receipt.blockNumber);
                included = true;
            } else {
                retryCount++;
                LOGGER.info('Transaction is still pending. Waiting for 5 seconds before next check.');
                await sleep(10000);
                if (retryCount == 4) {
                    LOGGER.error('Failed to fetch info on transaction block inclusion.');
                    included = false;
                }
            }
        } catch (error) {
            console.error('Error retrieving transaction receipt:', error);
            break;
        }
    }
    return included;
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function calculatePreTransactionEstimates(amount: BigNumber, tokenSymbol: string, network: string,  customGasLimit?: number) {
    const maxGasInEth = calculateApproximateGasPriceInETH(network, customGasLimit);
    const bridgeFee = calculateFee(amount);

    LOGGER.info('Estimated Bridge Fee: ' + bridgeFee);
    LOGGER.info('Approximate gas estimate: ' + maxGasInEth);
    LOGGER.info('Do you wish to proceed? (y/n)');
}