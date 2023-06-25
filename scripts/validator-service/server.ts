import express, { Request, Response } from 'express';

const app = express();
const port = process.env.PORT;

const dataRepository = require('./data/repository/repository')
const validator  = require('./utils/validator')

app.get('/api/validator/', (req:Request, res:Response) => {
    let lockedEventRecords = dataRepository.fetchLockedTokenEvents();
    res.send(lockedEventRecords)
});

app.post('/api/validator/update-balance', (req:Request, res:Response) => {
    let burntEventRecords = dataRepository.fetchBurntTokenEvents();
    res.send(burntEventRecords);
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});