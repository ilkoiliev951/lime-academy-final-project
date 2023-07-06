import {AUTH_BASE_URL, VALIDATOR_BASE_URL} from "./constants";
import {SiweMessage} from "siwe";
import {Wallet} from "ethers";
import {sign} from "crypto";
const request = require('request');

async function createSiweMessage(address: string, statement:string) {
    let endpoint = AUTH_BASE_URL + 'nonce';

    const noncePromise = new Promise((resolve, reject) => {
        request({
            url: endpoint,
            method: "GET",
            json: true
        }, (error, response) => {
            if (error) {
                console.error(error);
                resolve("");
            } else {
                if (response.statusCode === 200) {
                    resolve(response.body);
                } else {
                    resolve("");
                }
            }
        });
    });

    const nonce = await noncePromise;
    if (nonce) {
        const message = new SiweMessage({
            domain: 'login.xyz',
            address: address,
            statement: statement,
            uri: 'https://login.xyz',
            version: '1',
            chainId: 1,
            nonce: nonce.toString()
        });
        return message.prepareMessage();
    }
}

export async function signInWithEthereum(wallet: Wallet) {
    let endpoint = AUTH_BASE_URL + 'verify';
    const address = wallet.address;
    const message = await createSiweMessage(address, 'lime-siwe-secret');
    const signature = await wallet.signMessage(message);
    const reqBody = {
        signature: signature.toString(),
        message: message
    }

    const res =  new Promise((resolve, reject) => {
        request({
            url: endpoint,
            method: "POST",
            json: true,
            body: reqBody
        }, (error, response) => {
            if (error) {
                console.error(error);
                reject('');
            } else {
                if (response.statusCode === 200) {
                    resolve(response);
                } else {
                    reject('');
                }
            }
        });
    });
}

