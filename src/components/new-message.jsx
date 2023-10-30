"use client";

import { useContext, useState, useEffect } from "react";
import { ChatContext } from "@/app/layout.tsx";
import { socket } from "@/lib/socket.js";

export default function NewMessge() {
  const [messages, setMessages] = useState([]);

  const {
    currentUserId,
    currentUserName,
    selectedUserId,
    selectedUserName,
    currentRoomId,
  } = useContext(ChatContext);

  useEffect(() => {
    socket.on("receive_message", (messages) => {
      setMessages(messages);
    });

    return () => socket.off("receive_message");
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

      <form
        className="flex mb-12 w-1/4 gap-4 justify-center items-center"
        onSubmit={handleNewMessageSubmit}
      >
        <input
          className="p-2 w-4/6 h-full rounded text-gray-950"
          type="text"
          name="message"
          placeholder="Message"
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

      <ul className="w-1/4">
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
              <p>{message.text}</p>
              {message.attachment && (
                <img src={`/uploads/${message.attachment.fileName}`} alt="" />
              )}
            </li>
          );
        })}
      </ul>
    </article>
  );
}
