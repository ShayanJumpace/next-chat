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
      socket.join(roomId.toString());

      const foundRoomData = await roomModel
        .findOne({
          _id: roomId,
        })
        .populate({
          path: "messages",
          select: "sender text",
        });

      io.in(roomId.toString()).emit("receive_message", foundRoomData.messages);
    });

    socket.on("send_message", async (message) => {
      const foundRoomData = await roomModel.findOne({
        _id: message.room,
      });

      if (foundRoomData) {
        const messageData = await messageModel.create(message);
        await roomModel.updateOne(
          { _id: message.room },
          { messages: [...foundRoomData.messages, messageData._id] }
        );

        const updatedRoomData = await roomModel
          .findOne({
            _id: message.room,
          })
          .populate({
            path: "messages",
            select: "sender text",
          });

        io.in(message.room.toString()).emit(
          "receive_message",
          updatedRoomData.messages
        );
      }
    });

    socket.on("disconnect", () => {});
  });
}
