import {VALIDATOR_BASE_URL} from "../utils/constants";
import {BigNumber} from "ethers";
import {Response} from "express";
const request = require('request');

export async function validateMintRequest (tokenSymbol:string, tokenAddress: string, amount: BigNumber, userAddress: string) {
    let requestBodyJson = getRequestBody(tokenSymbol,tokenAddress, amount, userAddress)
    sendValidatorRequest(requestBodyJson, 'validate-mint')
}

export async function validateBurnRequest (tokenSymbol:string, tokenAddress: string, amount: BigNumber, userAddress: string) {
    let requestBodyJson = getRequestBody(tokenSymbol,tokenAddress, amount, userAddress)
    sendValidatorRequest(requestBodyJson, 'validate-burn')
}

export async function validateReleaseRequest (tokenSymbol:string, tokenAddress: string, amount: BigNumber, userAddress: string) {
    let requestBodyJson = getRequestBody(tokenSymbol,tokenAddress, amount, userAddress)
    sendValidatorRequest(requestBodyJson, 'validate-release')
}

export async function updateUserBalanceRequest (tokenSymbol:string, tokenAddress: string, amount: BigNumber, userAddress: string) {
    let requestBodyJson = getRequestBody(tokenSymbol,tokenAddress, amount, userAddress)
    sendValidatorRequest(requestBodyJson, 'update-balance')
}

function getRequestBody(tokenSymbol:string, tokenAddress: string, amount:BigNumber, userAddress: string) {
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
    }, function (error: Error, response: Response){
        // if (response.)
        console.log(response);
    });
}