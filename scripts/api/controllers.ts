import {InvalidUserAddressError} from './exceptions/InvalidUserAddress'
import express, { Request, Response } from 'express';

const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = process.env.PORT;

const dataRepository = require('./data/repository/repository')
const validator  = require('./utils/validator')

app.get('/api/bridge/fetch-locked', (req:Request, res:Response) => {
    let lockedEventRecords = dataRepository.fetchLockedTokenEvents();
    res.send(lockedEventRecords)
});

app.get('/api/bridge/fetch-burnt', (req:Request, res:Response) => {
    let burntEventRecords = dataRepository.fetchBurntTokenEvents();
    res.send(burntEventRecords);
});

app.post('/api/bridge/fetch-bridged-by-wallet', (req:Request, res:Response) => {
    let userAddress = req.body.address;
    if (!validator.userAddressIsValid(req.body.address)) {
        throw new InvalidUserAddressError()
    }

    let userBridgedEvents = dataRepository.fetchBridgedTokensByWallet(userAddress)
    res.send(userBridgedEvents);
});

app.get('/api/bridge/fetch-all-bridged', (req:Request, res:Response) => {
    let allBridgedEvents = dataRepository.fetchAllBridgedTokenAmounts()
    res.send(allBridgedEvents);
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});