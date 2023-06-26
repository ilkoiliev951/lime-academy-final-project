import {VALIDATOR_BASE_URL} from "../utils/constants";
const request = require('request');

export async function validateNewTokenRequest (tokenSymbol: string, tokenName: string) {
    let requestBodyJson = {
        tokenSymbol: tokenSymbol,
        tokenName: tokenName
    }
    sendValidatorRequest(requestBodyJson, 'validate-new-token')
}

export async function validateMintRequest (tokenSymbol, tokenAddress, amount, userAddress) {
    let requestBodyJson = getRequestBody(tokenSymbol,tokenAddress, amount, userAddress)
    sendValidatorRequest(requestBodyJson, 'validate-mint')
}

export async function validateBurnRequest (tokenSymbol, tokenAddress, amount, userAddress) {
    let requestBodyJson = getRequestBody(tokenSymbol,tokenAddress, amount, userAddress)
    sendValidatorRequest(requestBodyJson, 'validate-burn')
}

export async function validateReleaseRequest (tokenSymbol, tokenAddress, amount, userAddress) {
    let requestBodyJson = getRequestBody(tokenSymbol,tokenAddress, amount, userAddress)
    sendValidatorRequest(requestBodyJson, 'validate-release')
}

export async function updateUserBalanceRequest (tokenSymbol, tokenAddress, amount, userAddress) {
    let requestBodyJson = getRequestBody(tokenSymbol,tokenAddress, amount, userAddress)
    sendValidatorRequest(requestBodyJson, 'update-balance')
}

function getRequestBody(tokenSymbol, tokenAddress, amount, userAddress) {
    return  {
        tokenSymbol: tokenSymbol,
        tokenAddress: tokenAddress,
        amount: amount,
        user: userAddress
    };
}

function sendValidatorRequest(requestBody: any, apiEndpoint: string) {
    let endpoint = VALIDATOR_BASE_URL + apiEndpoint;
    request({
        url: endpoint,
        method: "POST",
        json: true,
        body: requestBody
    }, function (error, response, body){
        console.log(response);
    });
}


