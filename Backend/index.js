
import { app } from './app.js';
import express from 'express'
import dotenv from 'dotenv';
import connectdb from "./src/db/database.js";
dotenv.config({ path: './env' });


connectdb()
.then(() => {
    app.listen(process.env.PORT || 3000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})