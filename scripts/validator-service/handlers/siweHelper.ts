import {SiweMessage, generateNonce} from "siwe";
import {Request, Response} from 'express';

const hashSiweMessageMap =  new Map<string, {}>();

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
            expiresAt: message.expirationTime
        })

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
    const authObject = hashSiweMessageMap.get(req.body.sessionHash)
    if (!authObject) {
        res.status(401).json({ message: 'You have to first sign_in' });
        return;
    }

    console.log("User is authenticated!");
    res.setHeader('Content-Type', 'text/plain');
    res.send(`You are authenticated and your address is: ${req.session.siwe.address}`);
}

export async function getNonce (req: Request, res: Response) {
    const nonce = generateNonce();
    req.session.nonce = nonce;
    res.json(nonce)
}