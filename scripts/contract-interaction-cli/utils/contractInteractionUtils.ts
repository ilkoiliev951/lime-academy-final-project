import {ethers, Wallet} from "ethers";
import secrets from "../../../secrets.json";

const bridge = require("./../../../artifacts/contracts/EVMBridge.sol/EVMBridge.json");
const genericERC20 = require("../../../artifacts/contracts/GenericERC20.sol/GenericERC20.json");
const wrappedERC20 = require("../../../artifacts/contracts/WrappedERC20.sol/WrappedERC20.json");

export async function getWallet(privateKey: string, provider) {
    return new ethers.Wallet(
        privateKey,
        provider
    );
}

export async function getProvider(isLocal: boolean) {
    if (isLocal) {
        return new ethers.providers.JsonRpcProvider(
            "http://localhost:8545"
        );
    }
    return new ethers.providers.InfuraProvider(
        "sepolia",
        secrets.INFURA_KEY
    );
}

export function getBridgeContract(wallet: Wallet, contractAddress) {
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

export async function transactionIsIncludedInBlock (provider, txHash: string) {
    let included = false;
    let retryCount = 0;
    while (!included || retryCount<=3) {
        try {
            const receipt = await provider.getTransactionReceipt(txHash);
            if (receipt && receipt.blockNumber) {
                console.log('Transaction is confirmed and included in block', receipt.blockNumber);
                included = true;
            } else {
                retryCount++;
                console.log('Transaction is still pending. Waiting for 5 seconds before next check.');
                await sleep(10000);
                if (retryCount == 3) {

                }
            }
        } catch (error) {
            console.error('Error retrieving transaction receipt:', error);
            break;
        }
    }
    return included;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}