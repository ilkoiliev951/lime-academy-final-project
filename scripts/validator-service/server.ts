import express, {Request, Response} from 'express';
import {updateUserBalanceOnChain} from "./handlers/contractInteraction";
import {generateNonce, SiweMessage} from "siwe";
import Session from 'express-session'
const interactionUtils = require('../contract-interaction-cli/utils/contractInteractionUtils')
const config = require('./config/config.json')
const validator = require('./data/dbValidator')
validator.connect()

const port = 8082;
const app = express();
app.use(express.json());

// extending the SessionData interface in order to adapt to TS
declare module 'express-session' {
    interface SessionData {
        siwe: SiweMessage,
        nonce: string
    }
}

app.use(Session({
    name: 'siwe',
    secret: "lime-siwe-secret",
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false, sameSite: true }
}));

app.get('/nonce', async function (req, res) {
    const nonce = generateNonce()
    req.session.nonce = nonce;
    res.json(nonce)
});

app.post('/verify', async function (req: Request, res: Response) {
    try {
        if (!req.body.message) {
            res.status(422).json({message: 'Expected prepareMessage object as body.'});
            return;
        }

        console.log(req.body)
        console.log(req.body.message.address)

        let SIWEObject = new SiweMessage(req.body.message);
        const { data: message } = await SIWEObject.verify({ signature: req.body.signature, nonce: req.session.nonce });
        req.session.siwe = message;
        req.session.cookie.expires = new Date(message.expirationTime);
        req.session.save(() => res.status(200).send(true));
    } catch (e) {
        req.session.siwe = null;
        req.session.nonce = null;
        console.error(e);
        req.session.save(() => res.status(500).json({ message: e }));
    }
});

app.get('/personal_information', function (req, res) {
    if (!req.session.siwe) {
        res.status(401).json({ message: 'You have to first sign_in' });
        return;
    }
    console.log("User is authenticated!");
    res.setHeader('Content-Type', 'text/plain');
    res.send(`You are authenticated and your address is: ${req.session.siwe.address}`);
});

app.post('/logout', async function (req: Request, res: Response) {

});

app.get('/api/fetch-locked-awaiting', async (req: Request, res: Response) => {
    const awaitingLockedEvents = await validator.getAllActiveLockEvents();
    res.json(awaitingLockedEvents)
});

app.get('/api/fetch-burnt-awaiting', async (req: Request, res: Response) => {
    const awaitingBurntEvents = await validator.getAllActiveBurnEvents();
    res.json(awaitingBurntEvents)
});

app.post('/api/fetch-bridged-by-user', async (req: Request, res: Response) => {
    const allTransfers = await validator.getAllTransferredTokensByAddress(req.body.user);
    res.json(allTransfers)
});

app.get('/api/fetch-all-bridged', async (req: Request, res: Response) => {
    const awaitingBurntEvents = await validator.getAllActiveBurnEvents();
    res.json(awaitingBurntEvents)
});

app.post('/api/validator/validate-mint', async (req: Request, res: Response) => {
    const mintRequestIsValid = await validator.validateMint(req.body.tokenSymbol, req.body.tokenAddress, req.body.amount, req.body.user);
    if (mintRequestIsValid) {
        res.sendStatus(200);
        return;
    }
    res.sendStatus(406);
});

app.post('/api/validator/validate-burn', async (req: Request, res: Response) => {
    const burnRequestIsValid = await validator.validateBurn(req.body.tokenSymbol, req.body.tokenAddress, req.body.amount, req.body.user);
    if (burnRequestIsValid) {
        res.sendStatus(200);
        return;
    }
    res.sendStatus(406);
});

app.post('/api/validator/validate-release', async (req: Request, res: Response) => {
    console.log('here')
    const releaseRequestIsValid = await validator.validateRelease(req.body.tokenSymbol, req.body.tokenAddress, req.body.amount, req.body.user);
    if (releaseRequestIsValid) {
        console.log('valid')
        res.sendStatus(200);
        return;
    }
    console.log('invalid');
    res.sendStatus(406);
});

app.post('/api/validator/update-balance', async (req: Request, res: Response) => {
    let targetToken;
    let sourceToken;

    if (req.body.isSourceOperation) {
        targetToken = await validator.getTokenOnOtherChain(req.body.tokenSymbolSource)
        sourceToken = {
            tokenAddress: req.body.addressSource,
            tokenSymbol:req.body.tokenSymbolSource
        }
    } else {
        sourceToken = await validator.getTokenOnOtherChain(req.body.tokenSymbolTarget)
        targetToken = {
            tokenAddress:req.body.addressTarget,
            tokenSymbol: req.body.tokenSymbolTarget
        }
    }

    const targetProvider = await interactionUtils.getProvider(false);
    const targetWallet = await interactionUtils.getWallet(config.SETTINGS.ownerKey, targetProvider);
    let targetBalance = await interactionUtils.getUserTargetBalanceOnChain(targetWallet, targetToken.tokenAddress, req.body.user)

    const provider = await interactionUtils.getProvider(true);
    const wallet = await interactionUtils.getWallet(config.SETTINGS.ownerKey, provider);
    let sourceBalance = await interactionUtils.getUserSourceBalanceOnChain(wallet, sourceToken.tokenAddress, req.body.user)

    const updatedInDB = await validator.updateUserBalance(
        req.body.user,
        sourceToken.tokenSymbol,
        targetToken.tokenSymbol,
        sourceBalance,
        targetBalance
    );

    console.log('updated in db' + updatedInDB)

    if (updatedInDB) {
        const userBalanceUpdated = await updateUserBalanceOnChain(
            req.body.user,
            sourceToken.tokenSymbol,
            sourceBalance,
            targetToken.tokenSymbol,
            targetBalance
        );

        if (userBalanceUpdated) {
            res.sendStatus(200);
            return;
        }
    }
    console.log('Failed updating user balance after tx.')
    res.sendStatus(406);
});

app.listen(port, () => {
    console.log(`[server]: Validator API Server is running at http://localhost:` + port);
});