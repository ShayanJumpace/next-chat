"use client";

import { useContext, useState, useEffect } from "react";
import { ChatContext } from "@/app/layout.tsx";
import { socket } from "@/lib/socket.js";
import Image from "next/image.js";
import Link from "next/link.js";
export default function NewMessge() {
  const [messages, setMessages] = useState([]);
  const [usersTyping, setUsersTyping] = useState([]);

  const {
    currentUserId,
    currentUserName,
    selectedUserId,
    selectedUserName,
    currentRoomId,
  } = useContext(ChatContext);

  useEffect(() => {
    socket.on("update_messages", (messages) => {
      setMessages(messages);

      messages.forEach((message) => {
        if (
          message.receiver.toString() === currentUserId &&
          message.isSeen === false
        ) {
          socket.emit("update_seen_message", message);
        }
      });
    });

    return () => socket.off("update_messages");
  }, []);

  useEffect(() => {
    socket.on("receive_typing_flag", (currentUserData) => {
      setUsersTyping((usersTyping) => [...usersTyping, currentUserData]);
    });

    return () => socket.off("receive_typing_flag");
  }, []);

  useEffect(() => {
    socket.on("receive_clear_typing_flag", (currentUserData) => {
      setUsersTyping((usersTyping) =>
        usersTyping.filter((user) => {
          return user._id !== currentUserData._id;
        })
      );
    });

    return () => socket.off("receive_clear_typing_flag");
  }, []);

  async function handleNewMessageSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const messageData = {
      room: currentRoomId,
      sender: currentUserId,
      receiver: selectedUserId,
      text: formData.get("message"),
      attachment: {
        fileName: formData.get("attachment").name,
        fileType: formData.get("attachment").type,
        fileData: formData.get("attachment"),
      },
    };

    socket.emit("send_message", messageData);
  }

  return (
    <article className="flex flex-col justify-center items-center h-full">
      <h3 className="text-3xl mb-2">{`${currentUserName} -> ${selectedUserName}`}</h3>
      {usersTyping.map((user) => {
        if (user._id.toString() !== currentUserId) {
          return <p>{user.userName} Typing...</p>;
        }
      })}

      <form
        className="flex mb-12 w-1/2 lg:w-1/4 gap-4 justify-center items-center"
        onSubmit={handleNewMessageSubmit}
      >
        <input
          className="p-2 w-4/6 h-full rounded text-gray-950"
          type="text"
          name="message"
          placeholder="Message"
          onFocus={() => {
            socket.emit("send_typing_user", currentRoomId, currentUserId);
          }}
          onBlur={() => {
            socket.emit("clear_typing_user", currentRoomId, currentUserId);
          }}
        />
        <label className="w-1/6 cursor-pointer text-gray-950 bg-white rounded text-center text-3xl">
          +
          <input
            className="w-full hidden h-full rounded text-gray-950"
            type="file"
            name="attachment"
            placeholder="Attachment"
          />
        </label>
        <button
          className="bg-white w-1/6 text-xl font-bold text-gray-950 h-full rounded"
          type="submit"
        >
          {`>`}
        </button>
      </form>

      <ul className="w-1/2 lg:w-1/4">
        {messages.map((message) => {
          return (
            <li
              className={
                currentUserId === message.sender.toString()
                  ? "text-left"
                  : "text-right"
              }
              key={message._id}
            >
              {message.attachment && <Fileviewer tag={message.attachment} />}
              {message.attachment && message.text && <br />}
              <p className="inline-block">{message.text}</p>
              {message.isSeen ? "✔️" : "❌"}
            </li>
          );
        })}
      </ul>
    </article>
  );
}

const Fileviewer = (props) => {
  const { tag } = props;
  // console.log(tag.fileType);
  // if (tag.fileType === "image/png") {
  //   return <img src={`/uploads/${tag.fileName}`} alt="" />;
  // }
  // if (tag.fileType === "image/png" || tag.fileType === "image/jpeg") {
  //   return <img src={`/uploads/${tag.fileName}`} alt="" />;
  // }
  // if (tag.fileType === "application/pdf") {
  //   console.log(tag);
  return (
    <>
      <Link
        className="text-blue-600 underline"
        href={`http://192.168.1.42:4321/${tag.fileName}`}
        target="_blank"
      >
        {tag.fileName}
      </Link>
    </>
  );
  // }
};
