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
    };

    socket.emit("send_message", messageData);
  }

  return (
    <article className="flex flex-col justify-center items-center h-full">
      <h3 className="text-3xl mb-2">{`${currentUserName} -> ${selectedUserName}`}</h3>

      <form
        className="flex mb-12 w-1/4 gap-4 items-center"
        onSubmit={handleNewMessageSubmit}
      >
        <input
          className="p-2 rounded text-gray-950"
          type="text"
          name="message"
          placeholder="Message"
        />
        <button className="bg-white text-gray-950 p-2 rounded" type="submit">
          Send
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
              {message.text}
            </li>
          );
        })}
      </ul>
    </article>
  );
}
