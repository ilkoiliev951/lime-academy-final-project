import {SiweMessage, generateNonce} from "siwe";
import {Request, Response} from 'express';

interface AuthData{
    siwe: SiweMessage;
    nonce: string;
    expirationTime: Date
}

const hashSiweMessageMap = new Map<string, AuthData>();

export async function handleSIWELogin (req: Request, res: Response) {
    try {

        if (!req.body.sessionHash) {
            res.status(422).json({message: 'Unable to resolve user session hash from request'});
            return;
        }

        if (!req.body.message) {
            res.status(422).json({message: 'Expected prepareMessage object as body.'});
            return;
        }

        let SIWEObject = new SiweMessage(req.body.message);
        // Verify that the message has been signed by the wallet's address and contains the exact nonce
        const { data: message } = await SIWEObject.verify({ signature: req.body.signature, nonce: req.session.nonce });
        req.session.siwe = message
        req.session.cookie.expires = new Date(message.expirationTime)
        req.session.nonce = message.nonce

        hashSiweMessageMap.set(req.body.sessionHash, {
            siwe: message,
            nonce: message.nonce,
            expirationTime: new Date(message.expirationTime)
        })

        console.log('User authenticated successfully')
        req.session.save(() => res.status(200).send(true));
    } catch (e) {
        req.session.siwe = null;
        req.session.nonce = null;
        req.session.save(() => res.status(500).json({ message: e }));
    }
}

export function handleSIWELogout (req: Request, res: Response) {
    if (req.body.sessionHash && hashSiweMessageMap.get(req.body.sessionHash)) {
        hashSiweMessageMap.get(req.body.sessionHash)

        hashSiweMessageMap.delete(req.body.sessionHash)
        req.session.siwe = null;
        req.session.nonce = null;
        req.session.save(() => res.status(200).send(true));
    }
    req.session.save(() => res.status(500).json({ message: 'User logout failed'}));
}

export async function isUserAuthenticated (req: Request, res: Response) {
    console.log(req.body.sessionHash)
    const authObject: AuthData = hashSiweMessageMap.get(req.body.sessionHash)
    console.log(JSON.stringify(authObject))
    if (!authObject || !authObject.siwe) {
        res.status(401).json({message: 'You have to first sign_in'});
        return;
    }
    const currentTime = new Date();
    let isExpired = currentTime > authObject.expirationTime;
    if (isExpired) {
        res.status(401).json({message: 'SIWE Signature has expired. Log in again.'});
        return;
    }

    res.setHeader('Content-Type', 'text/plain');
    res.send(`User is authenticated with SIWE signature: ${req.session.siwe}`);
}

export async function getNonce (req: Request, res: Response) {
    const nonce = generateNonce();
    req.session.nonce = nonce;
    res.json(nonce)
}