"use client";

import type { ReactNode } from "react";
import { createContext, useState } from "react";
import "./globals.css";

export const ChatContext = createContext({});

export default function RootLayout({ children }: { children: ReactNode }) {
  const [currentUserId, setCurrentUserId] = useState("");
  const [currentUserName, setCurrentUserName] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUserName, setSelectedUserName] = useState("");
  const [currentRoomId, setCurrentRoomId] = useState("");

  return (
    <html lang="en">
      <body>
        <ChatContext.Provider
          value={{
            currentUserId,
            setCurrentUserId,
            currentUserName,
            setCurrentUserName,
            selectedUserId,
            setSelectedUserId,
            selectedUserName,
            setSelectedUserName,
            currentRoomId,
            setCurrentRoomId,
          }}
        >
          <header>
            <nav></nav>
          </header>
          <main>{children}</main>
          <footer></footer>
        </ChatContext.Provider>
      </body>
    </html>
  );
}
