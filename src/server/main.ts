// node
import path from "node:path";
import { fileURLToPath } from "node:url";

// libraries
import express from "express";
import cors from "cors";
import { config } from "dotenv";
import { setupDB } from "./db.ts";
import { setupChatSocket } from "./sockets/chat-socket.js";

// routers
import userRouter from "./routers/user-router.ts";

// constants
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config();

setupDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(`${__dirname}/uploads`));

app.use("/api", userRouter);

const BASE_URL = process.env.BASE_URL || "http://192.168.1.42";
const PORT = process.env.PORT || 4321;

const server = app.listen(PORT, () => {
  console.log(`Server Started on Port ${BASE_URL}:${PORT} Successfully!`);
});

setupChatSocket(server, "http://192.168.1.42:3000", `${__dirname}/uploads`);
