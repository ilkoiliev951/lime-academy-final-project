const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT;

app.post('/api/bridge/fetch-locked', (req, res) => {
    res.send('Express + TypeScript Server');
});

app.post('/api/bridge/fetch-burnt', (req, res) => {
    res.send('Express + TypeScript Server');
});

app.post('/api/bridge/fetch-bridged-by-wallet', (req, res) => {
    res.send('Express + TypeScript Server');
});

app.post('/api/bridge/fetch-all-bridged', (req, res) => {
    res.send('Express + TypeScript Server');
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});