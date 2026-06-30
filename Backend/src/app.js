import "dotenv/config";

import express from "express";
import { createServer } from "node:http";

import mongoose from "mongoose";

import cors from "cors";
import { connectToSocket } from "./controllers/socketManager.js";


import userRoutes from "./routes/users.routes.js";

const app = express();
const server = createServer(app);
connectToSocket(server);


app.set("port", (process.env.PORT || 3000));
app.use(cors());

// json data: axios.get/post
app.use(express.json({ limit: "40kb" })); // Without these two lines, if you try to log req.body, it will return undefined.
// form data
app.use(express.urlencoded({ extended: true, limit: "40kb" }));

app.use("/api/v1/users", userRoutes);
// app.use("/api/v2/users", newUserRoutes);    for newer version of the app

const start = async () => {

    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB is connected");

    server.listen(app.get("port"), () => {
        console.log("server is connected");
    });
}

start();