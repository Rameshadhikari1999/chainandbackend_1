// require("dotenv").config();
import  dotenv  from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
dotenv.config({ path: "./.env" });

connectDB()
.then(() => {
    app.on("error",(error) => console.log("server error",error));
    app.listen(process.env.PORT, () => {
        console.log(`⚙ server is running on port ${process.env.PORT || 8000}`);
    })
})
.catch((error) => {
    console.log("MongoDB connection FAILD: ", error);
    throw error;
})










/*
import express from "express";
const app = express();


(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log('database connected');
        app.on(error => console.log(error));

        app.listen(process.env.PORT, () => {
            console.log(`server is running on port ${process.env.PORT}`);
        })
    } catch (error) {
        console.log(error);
        throw error;
    }
})()

*/
