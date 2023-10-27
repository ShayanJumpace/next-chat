"use client";

import { useRouter } from "next/navigation.js";
import { useContext, useEffect, useState } from "react";
import { ChatContext } from "@/app/layout.tsx";
import { socket } from "@/lib/socket.js";

export default function NewChat() {
  const [users, setUsers] = useState([]);
  const {
    currentUserId,
    currentUserName,
    setSelectedUserId,
    setSelectedUserName,
    setCurrentRoomId,
  } = useContext(ChatContext);

  const router = useRouter();

  useEffect(() => {
    (async () => {
      const response = await fetch("http://192.168.1.42:4321/api/users");

      if (response.ok) {
        const usersResponse = await response.json();
        setUsers(
          usersResponse.data.usersData.map((user) => {
            return {
              _id: user._id,
              userName: user.userName,
            };
          })
        );
      }
    })();
  }, []);

  async function handleNewChatSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const receiver = formData.get("receiver");

    const selectedUser = users.find((user) => {
      return user.userName === receiver;
    });

    const response = await fetch("http://192.168.1.42:4321/api/joinroom", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        senderUserName: currentUserName,
        receiverUserName: selectedUser?.userName,
      }),
    });

    if (response.ok) {
      const roomResponse = await response.json();

      setCurrentRoomId(roomResponse.data.roomData._id);

      socket.emit("join_room", roomResponse.data.roomData._id);
    }

    setSelectedUserId(selectedUser?._id);
    setSelectedUserName(selectedUser?.userName);

    router.push("/message");
  }

  return (
    <article className="flex flex-col justify-center items-center h-full">
      <h3 className="text-3xl mb-2">{currentUserName}</h3>
      <p className="mb-12">{currentUserId}</p>

      <form
        className="flex w-1/4 flex-col gap-4"
        onSubmit={handleNewChatSubmit}
      >
        <select className="p-2 text-gray-950 rounded" name="receiver">
          {users.map((user) => {
            return (
              <option value={user.userName} key={user._id}>
                {user.userName}
              </option>
            );
          })}
        </select>
        <button className="bg-white text-gray-950 p-2 rounded" type="submit">
          New Chat
        </button>
      </form>
    </article>
  );
}
