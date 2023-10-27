import express from "express";
import cors from "cors";
import { config } from "dotenv";
import { setupDB } from "./db.ts";
import { setupSocket } from "./socket.js";

import userRouter from "./routers/user-router.ts";

config();

setupDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", userRouter);

const BASE_URL = process.env.BASE_URL || "http://192.168.1.42";
const PORT = process.env.PORT || 4321;

const server = app.listen(PORT, () => {
  console.log(`Server Started on Port ${BASE_URL}:${PORT} Successfully!`);
});

setupSocket(server);
