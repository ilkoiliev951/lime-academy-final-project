import {VALIDATOR_BASE_URL} from "../utils/constants";
const request = require('request');

export async function validateNewTokenRequest (tokenSymbol: string, tokenName: string) {
    let requestBodyJson = {
        tokenSymbol: tokenSymbol,
        tokenName: tokenName
    };

    sendValidatorRequest(requestBodyJson, 'validate-new-token')
}

export async function validateMintRequest () {
    let requestBodyJson = {

    };

    sendValidatorRequest(requestBodyJson, 'validate-mint')
}

export async function validateBurnRequest () {
    let requestBodyJson = {

    };

    sendValidatorRequest(requestBodyJson, 'validate-burn')
}

export async function validateReleaseRequest () {
    let requestBodyJson = {

    };

    sendValidatorRequest(requestBodyJson, 'validate-release')
}

export async function updateUserBalanceRequest () {
    let requestBodyJson = {

    };

    sendValidatorRequest(requestBodyJson, 'update-balance')
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


