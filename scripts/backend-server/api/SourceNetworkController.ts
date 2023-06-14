const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT;

app.post('/api/bridge/lock', (req, res) => {
    res.send('Express + TypeScript Server');
});

app.post('/api/bridge/claim', (req, res) => {
    res.send('Express + TypeScript Server');
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});