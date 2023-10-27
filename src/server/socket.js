import { Server } from "socket.io";

import userModel from "./models/user-model.ts";
import roomModel from "./models/room-model.ts";
import messageModel from "./models/message-model.ts";

export function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://192.168.1.42:3000",
    },
  });

  io.on("connection", (socket) => {
    socket.on("join_room", async (roomId) => {
      socket.join(roomId);

      const foundRoomData = await roomModel
        .findOne({
          _id: roomId,
        })
        .populate({
          path: "messages",
          select: "sender text",
        });

      io.in(roomId).emit("receive_message", foundRoomData.messages);
    });

    socket.on("send_message", async (message) => {
      const foundRoomData = await roomModel.findOne({
        _id: message.roomId,
      });

      if (foundRoomData) {
        const messageData = await messageModel.create(message);
        await roomModel.updateOne(
          { _id: message.roomId },
          { messages: [...foundRoomData.messages, messageData._id] }
        );

        const updatedRoomData = await roomModel
          .findOne({
            _id: message.roomId,
          })
          .populate({
            path: "messages",
            select: "sender text",
          });

        io.in(message.roomId).emit("receive_message", updatedRoomData.messages);
      }
    });

    socket.on("disconnect", () => {});
  });
}
