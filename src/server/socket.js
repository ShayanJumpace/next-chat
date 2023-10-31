import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeFile } from "node:fs";

import { Server } from "socket.io";

import roomModel from "./models/room-model.ts";
import messageModel from "./models/message-model.ts";
import fileModel from "./models/file-model.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://192.168.1.42:3000",
    },
    maxHttpBufferSize: 1e8, // 100 MB
  });

  io.on("connection", (socket) => {
    let foundRoomData;

    socket.on("join_room", async (roomId) => {
      socket.join(roomId.toString());

      foundRoomData = await roomModel
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

      io.in(roomId.toString()).emit("receive_message", foundRoomData.messages);
    });

    socket.on("send_message", async (message) => {
      // const foundRoomData = await roomModel.findOne({
      //   _id: message.room,
      // });

      if (foundRoomData) {
        if (message.attachment.fileName !== "") {
          const attachment = {
            fileName: message.attachment.fileName,
            fileType: message.attachment.fileType,
          };
          const attachmentData = await fileModel.create(attachment);

          const file = message.attachment.fileData;
          writeFile(
            `${__dirname}/../../public/uploads/${attachment.fileName}`,
            file,
            (err) => {
              if (err) console.log(err, file);
            }
          );

          message = { ...message, attachment: attachmentData._doc._id };
        } else {
          message = { ...message, attachment: undefined };
        }

        const messageData = await messageModel.create(message);
        await roomModel.updateOne(
          { _id: message.room },
          { messages: [...foundRoomData.messages, messageData._id] }
        );

        foundRoomData = await roomModel
          .findOne({
            _id: message.room,
          })
          .populate({
            path: "messages",
            select: "room sender receiver text attachment isSeen",
            populate: {
              path: "attachment",
              model: "file",
            },
          });

        io.in(message.room.toString()).emit(
          "receive_message",
          foundRoomData.messages
        );
      }
    });

    socket.on("messages_seen", async (message) => {
      await messageModel.findOneAndUpdate(
        { _id: message._id },
        { isSeen: true }
      );

      foundRoomData = await roomModel
        .findOne({
          _id: message.room,
        })
        .populate({
          path: "messages",
          select: "room sender receiver text attachment isSeen",
          populate: {
            path: "attachment",
            model: "file",
          },
        });

      io.in(message.room.toString()).emit(
        "receive_message",
        foundRoomData.messages
      );
    });

    socket.on("disconnect", () => {});
  });
}
