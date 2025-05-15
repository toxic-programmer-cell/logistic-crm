import express from 'express';

require('dotenv').config();
const app = express();

app.get('/', (req,  res) => {
    res.send("server is running")
})
