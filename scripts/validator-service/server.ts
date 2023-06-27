import express, { Request, Response } from 'express';

const app = express();
const port = process.env.VALIDATOR_API_PORT;
const dataSource = require('./data/dataSource')

const dataRepository = require('./data/dbValidator')
const validator  = require('./utils/validator')


//Establish DB connection
dataSource
    .initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err)
    })


app.post('/api/validator/validate-new-token', (req:Request, res:Response) => {
    //let burntEventRecords = dataRepository.
    //res.send(burntEventRecords);
});

app.post('/api/validator/validate-mint', (req:Request, res:Response) => {
   // let burntEventRecords = dataRepository.fetchBurntTokenEvents();
   // res.send(burntEventRecords);
});

app.post('/api/validator/validate-burn', (req:Request, res:Response) => {
    // let burntEventRecords = dataRepository.fetchBurntTokenEvents();
    //res.send(burntEventRecords);
});

app.post('/api/validator/validate-release', (req:Request, res:Response) => {
    // let burntEventRecords = dataRepository.fetchBurntTokenEvents();
    // res.send(burntEventRecords);
});

app.post('/api/validator/update-balance', (req:Request, res:Response) => {
    // update the db user balance for both networks
    // update the user balance on both chains

    // let burntEventRecords = dataRepository.fetchBurntTokenEvents();
    // res.send(burntEventRecords);
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});