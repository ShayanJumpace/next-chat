// node
import { writeFile } from "node:fs";

// libraries
import { Server } from "socket.io";

// models
import userModel from "../models/user-model.ts";
import roomModel from "../models/room-model.ts";
import messageModel from "../models/message-model.ts";
import fileModel from "../models/file-model.ts";

// setting up chat socket
export function setupChatSocket(server, origin, fileUploadPath) {
  const io = new Server(server, {
    cors: {
      origin,
    },
    maxHttpBufferSize: 1e8, // 100 MB
  });

  io.on("connection", (socket) => {
    socket.on("join_room", async (roomId) => {
      joinRoom(io, socket, roomId);
    });

    socket.on("send_message", async (message) => {
      sendMessage(io, socket, message, fileUploadPath);
    });

    socket.on("update_seen_message", async (message) => {
      updateSeenMessage(io, socket, message);
    });

    socket.on("send_typing_user", async (roomId, userId) => {
      sendTypingUser(io, socket, roomId, userId);
    });

    socket.on("clear_typing_user", async (roomId, userId) => {
      clearTypingUser(io, socket, roomId, userId);
    });

    socket.on("disconnect", () => {});
  });
}

async function joinRoom(io, socket, roomId) {
  socket.join(roomId.toString());

  const foundRoomData = await getRoomData(roomId);

  io.in(roomId.toString()).emit("update_messages", foundRoomData.messages);
}

async function sendMessage(io, _socket, message, fileUploadPath) {
  const foundRoomData = await getRoomData(message.room);

  if (foundRoomData) {
    if (message.attachment.fileName !== "") {
      const attachment = {
        fileName: message.attachment.fileName,
        fileType: message.attachment.fileType,
      };
      const attachmentData = await fileModel.create(attachment);

      const file = message.attachment.fileData;
      writeFile(`${fileUploadPath}/${attachment.fileName}`, file, (err) => {
        if (err) console.log(err, file);
      });

      message = { ...message, attachment: attachmentData._doc._id };
    } else {
      message = { ...message, attachment: undefined };
    }

    if (message.text !== "" || message.attachment !== undefined) {
      const messageData = await messageModel.create(message);
      await roomModel.updateOne(
        { _id: message.room },
        { messages: [...foundRoomData.messages, messageData._id] }
      );

      foundRoomData = await getRoomData(message.room);

      io.in(message.room.toString()).emit(
        "update_messages",
        foundRoomData.messages
      );
    }
  }
}

async function updateSeenMessage(io, _socket, message) {
  await messageModel.findOneAndUpdate({ _id: message._id }, { isSeen: true });

  const foundRoomData = await getRoomData(message.room);

  io.in(message.room.toString()).emit(
    "update_messages",
    foundRoomData.messages
  );
}

async function sendTypingUser(io, _socket, roomId, userId) {
  const currentUserData = await userModel.findOne({ _id: userId });

  io.in(roomId.toString()).emit("receive_typing_flag", currentUserData);
}

async function clearTypingUser(io, _socket, roomId, userId) {
  const currentUserData = await userModel.findOne({ _id: userId });

  io.in(roomId.toString()).emit("receive_clear_typing_flag", currentUserData);
}

async function getRoomData(roomId) {
  return await roomModel
    .findOne({
      _id: roomId,
    })
    .populate({
      path: "messages",
      select: "room sender receiver text attachment isSeen",
      populate: {
        path: "attachment",
        model: "file",
      },
    });
}
