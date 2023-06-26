import express, { Request, Response } from 'express';

const app = express();
const port = process.env.PORT;

const dataRepository = require('./data/repository/repository')
const validator  = require('./utils/validator')

app.post('/api/validator/validate-new-token', (req:Request, res:Response) => {
    let burntEventRecords = dataRepository.fetchBurntTokenEvents();
    res.send(burntEventRecords);
});

app.post('/api/validator/validate-mint', (req:Request, res:Response) => {
    let burntEventRecords = dataRepository.fetchBurntTokenEvents();
    res.send(burntEventRecords);
});

app.post('/api/validator/validate-burn', (req:Request, res:Response) => {
    let burntEventRecords = dataRepository.fetchBurntTokenEvents();
    res.send(burntEventRecords);
});

app.post('/api/validator/validate-release', (req:Request, res:Response) => {
    let burntEventRecords = dataRepository.fetchBurntTokenEvents();
    res.send(burntEventRecords);
});

app.post('/api/validator/update-balance', (req:Request, res:Response) => {
    let burntEventRecords = dataRepository.fetchBurntTokenEvents();
    res.send(burntEventRecords);
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});