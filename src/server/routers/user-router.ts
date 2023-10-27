import { Router } from "express";
import {
  getAllUsers,
  logIn,
  joinRoom,
  getRoom,
} from "../controllers/chat-controller.js";

const userRouter = Router();

userRouter.get("/users", getAllUsers);
userRouter.post("/login", logIn);
userRouter.post("/room", getRoom);
userRouter.post("/joinroom", joinRoom);

export default userRouter;
