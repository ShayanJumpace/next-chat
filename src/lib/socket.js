import { io } from "socket.io-client";

export const socket = io(`http://192.168.1.42:4321`);
