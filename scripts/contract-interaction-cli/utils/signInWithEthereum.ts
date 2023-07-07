import {AUTH_BASE_URL, VALIDATOR_BASE_URL} from "./constants";
import {SiweMessage} from "siwe";
import {Wallet} from "ethers";
const request = require('request');
const os = require('os');
const secrets = require('./../../../secrets.json')
const crypto = require('crypto');

async function createSiweMessage(address: string, statement:string): Promise<SiweMessage> {
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
        const expirationTime = new Date();
        expirationTime.setHours(expirationTime.getHours() + 3);

        return new SiweMessage({
            domain: 'login.xyz',
            address: address,
            statement: statement,
            uri: 'https://login.xyz',
            version: '1',
            chainId: 1,
            nonce: nonce.toString(),
            expirationTime: expirationTime.toTimeString()
        });
    }
}

export async function signInWithEthereum(wallet: Wallet) {
    let endpoint = AUTH_BASE_URL + 'verify';
    const address = wallet.address;
    const message = await createSiweMessage(address, 'lime-siwe-secret-login');
    const signature = await wallet.signMessage(message.prepareMessage());
    const hash = getSessionHash(message.nonce)
    const reqBody = {
        signature: signature.toString(),
        message: message,
        sessionHash: hash
    }

    console.log('Hash is: ' + hash)

    const res =  new Promise((resolve, reject) => {
        request({
            url: endpoint,
            method: "POST",
            json: true,
            body: reqBody
        }, (error, response) => {
            if (error) {
                console.error(error);
                reject('Authentication failed');
            } else {
                if (response.statusCode === 200) {
                    console.log(response)
                    resolve(true);
                } else {
                    reject('Authentication failed');
                }
            }
        });
    });
    await res;
}

export async function signOut(wallet: Wallet, nonce) {
    let endpoint = AUTH_BASE_URL + 'logout';
    const hash = getSessionHash(nonce)

    const reqBody = {
        sessionHash: hash
    }

    const res =  new Promise((resolve, reject) => {
        request({
            url: endpoint,
            method: "POST",
            json: true,
            body: reqBody
        }, (error, response) => {
            if (error) {
                console.info('Logging out was unsuccessful.')
                console.error(error);
                resolve(false)
            } else {
                if (response.statusCode === 200) {
                    resolve(true);
                } else {
                    reject('');
                }
            }
        });
    });
    return await res;
}

export async function userAuthenticated(nonce) {
    let endpoint = AUTH_BASE_URL + 'isAuthenticated';
    const reqBody = {
        sessionHash: getSessionHash(nonce)
    }

    console.log('Hash: ' + reqBody.sessionHash + ' for nonce: ' + nonce)

    const res =  new Promise((resolve, reject) => {
        request({
            url: endpoint,
            method: "POST",
            json: true,
            body: reqBody
        }, (error, response) => {
            if (error) {
                console.info('User is not authenticated')
                console.error(error);
                resolve(false)
            } else {
                if (response.statusCode === 200) {
                    resolve(true);
                } else {
                    console.info('User is not authenticated')
                    reject(false);
                }
            }
        });
    });
    return await res;
}

function getSessionHash (salt: string): string {
    let ip = getLocalIpAddress();
    if (ip) {
        let valueToHash = secrets.PRIVATE_KEY + ip;
        return hashValueWithSecret(valueToHash, salt);
    }

    return '';
}

function getLocalIpAddress() {
    const interfaces = os.networkInterfaces();
    for (const interfaceName in interfaces) {
        const iface = interfaces[interfaceName];
        for (const { family, address, internal } of iface) {
            if (family === 'IPv4' && !internal) {
                console.log(address)
                return address;
            }
        }
    }
    return null;
}

function hashValueWithSecret(value, secret) {
    const hash = crypto.createHmac('sha256', secret);
    hash.update(value);
    return hash.digest('hex');
}
