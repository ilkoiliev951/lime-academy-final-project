import {VALIDATOR_BASE_URL} from "../utils/constants";
const request = require('request');

export async function validateMintRequest (tokenSymbol:string, tokenAddress: string, amount: string, userAddress: string) {
    let requestBodyJson = getRequestBody(tokenSymbol,tokenAddress, amount, userAddress)
    return await sendValidatorRequest(requestBodyJson, 'validate-mint')
}

export async function validateBurnRequest (tokenSymbol:string, tokenAddress: string, amount: string, userAddress: string) {
    let requestBodyJson = getRequestBody(tokenSymbol,tokenAddress, amount, userAddress)
    return await sendValidatorRequest(requestBodyJson, 'validate-burn')
}

export async function validateReleaseRequest (tokenSymbol:string, tokenAddress: string, amount: string, userAddress: string) {
    let requestBodyJson = getRequestBody(tokenSymbol,tokenAddress, amount, userAddress)
    return await sendValidatorRequest(requestBodyJson, 'validate-release')
}

export async function updateUserBalanceRequest (
    userAddress: string,
    amount: string,
    tokenSymbolSource: string,
    tokenAddressSource: string,
    tokenSymbolTarget: string,
    tokenAddressTarget: string,
    isSourceOperation) {

    let requestBodyJson = {
        user: userAddress,
        tokenSymbolSource: tokenSymbolSource,
        tokenSymbolTarget: tokenSymbolTarget,
        addressSource: tokenAddressSource,
        addressTarget: tokenAddressTarget,
        isSourceOperation: isSourceOperation,
        amount: amount
    }

    return await sendValidatorRequest(requestBodyJson, 'update-balance')
}

function getRequestBody(tokenSymbol:string, tokenAddress: string, amount:string , userAddress: string) {
    return  {
        tokenSymbol: tokenSymbol,
        tokenAddress: tokenAddress,
        amount: amount,
        user: userAddress
    };
}

async function sendValidatorRequest(requestBody, apiEndpoint) {
    let endpoint = VALIDATOR_BASE_URL + apiEndpoint;

    return new Promise((resolve, reject) => {
        request({
            url: endpoint,
            method: "POST",
            json: true,
            body: requestBody
        }, (error, response) => {
            if (error) {
                console.error(error);
                resolve(false);
            } else {
                if (response.statusCode === 200) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }
        });
    });
}