import express, {Request, Response} from 'express';
import {updateUserBalanceOnChain} from "./contractInteraction";

const interactionUtils = require('./../contract-interaction-cli/utils/contractInteractionUtils')
const config = require('./config/config.json')

const port = 8082;
const app = express();
app.use(express.json());

const validator = require('./data/dbValidator')
validator.connect()


app.post('/api/validator/validate-mint', async (req: Request, res: Response) => {
    const mintRequestIsValid = await validator.validateMint(req.body.tokenSymbol, req.body.tokenAddress, req.body.amount, req.body.user);
    if (mintRequestIsValid) {
        res.sendStatus(200);
        return;
    }
    res.sendStatus(406);
});

app.post('/api/validator/validate-burn', async (req: Request, res: Response) => {
    console.log('=======')
    console.log(req.body.tokenSymbol)
    console.log(req.body.tokenAddress)
    console.log(req.body.amount)
    console.log(req.body.user)
    const burnRequestIsValid = await validator.validateBurn(req.body.tokenSymbol, req.body.tokenAddress, req.body.amount, req.body.user);
    if (burnRequestIsValid) {
        res.sendStatus(200);
        return;
    }
    res.sendStatus(406);
});

app.post('/api/validator/validate-release', async (req: Request, res: Response) => {
    const releaseRequestIsValid = await validator.validateRelease(req.body.tokenSymbol, req.body.tokenAddress, req.body.amount, req.body.user);
    if (releaseRequestIsValid) {
        res.sendStatus(200);
        return;
    }
    res.sendStatus(406);
});

app.post('/api/validator/update-balance', async (req: Request, res: Response) => {
    let targetToken;
    let sourceToken;

    console.log(req.body.isSourceOperation)

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