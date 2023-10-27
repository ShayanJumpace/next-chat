"use client";

import { useContext } from "react";
import { useRouter } from "next/navigation.js";
import { ChatContext } from "@/app/layout.tsx";

export default function Login() {
  const { setCurrentUserId, setCurrentUserName } = useContext(ChatContext);

  const router = useRouter();

  async function handleLoginSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const userName = formData.get("userName");

    if (userName !== "") {
      const response = await fetch("http://192.168.1.42:4321/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userName }),
      });

      if (response.ok) {
        const userResponse = await response.json();

        setCurrentUserId(userResponse.data.userData._id);
        setCurrentUserName(userResponse.data.userData.userName);

        router.push("/chat");
      }
    }
  }

  return (
    <article className="flex justify-center items-center h-full">
      <form className="flex w-1/4 flex-col gap-4" onSubmit={handleLoginSubmit}>
        <input
          className="p-2 text-gray-950 rounded"
          type="text"
          name="userName"
          placeholder="User Name"
        />
        <button className="bg-white text-gray-950 p-2 rounded" type="submit">
          Log In
        </button>
      </form>
    </article>
  );
}
