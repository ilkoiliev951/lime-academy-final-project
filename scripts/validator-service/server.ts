import express, { Request, Response } from 'express';

const app = express();
const port = process.env.VALIDATOR_API_PORT;
const dataSource = require('./data/dataSource')
const validator = require('./data/dbValidator')

dataSource
    .initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err)
    })


 app.post('/api/validator/validate-new-token', async (req:Request, res:Response) => {
    const newTokenRequestIsValid = await validator.validateNewToken(req.body.tokenSymbol, req.body.tokenName);
    if (newTokenRequestIsValid) {
        res.sendStatus(200);
        return;
    }
    res.sendStatus(406);
});

app.post('/api/validator/validate-mint', async (req:Request, res:Response) => {
   const mintRequestIsValid = await validator.validateMint(req.body.tokenSymbol, req.body.tokenAddress, req.body.amount, req.body.user);
    if (mintRequestIsValid) {
        res.sendStatus(200);
        return;
    }
    res.sendStatus(406);
});

app.post('/api/validator/validate-burn', async (req:Request, res:Response) => {
    const burnRequestIsValid = await validator.validateBurn(req.body.tokenSymbol, req.body.tokenAddress, req.body.amount, req.body.user);
    if (burnRequestIsValid) {
        res.sendStatus(200);
        return;
    }
    res.sendStatus(406);
});

app.post('/api/validator/validate-release', async (req:Request, res:Response) => {
    const releaseRequestIsValid = await validator.validateRelease(req.body.tokenSymbol, req.body.tokenAddress, req.body.amount, req.body.user);
    if (releaseRequestIsValid) {
        res.sendStatus(200);
        return;
    }
    res.sendStatus(406);
});

app.post('/api/validator/update-balance', async (req:Request, res:Response) => {
    const userBalanceUpdated = await validator.updateUserBalance(req.body.tokenSymbol, req.body.tokenAddress, req.body.amount, req.body.user);
    if (userBalanceUpdated) {
        res.sendStatus(200);
        return;
    }
    res.sendStatus(406);
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});