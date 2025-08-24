// src/pages/MessagesPage.jsx
import React, { useState } from "react";
import styles from "./MessagesPage.module.css";
import Chat from "../components/Chat/Chat";
import MessagesLeftBar from "../components/MessagesLeftBar/MessagesLeftBar";
import ChatComponent from "../components/Chat/ChatComponent";

const MessagesPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

  const handleBack = () => {
    setSelectedUser(null);
  };

  return (
    <div className={styles.page}>
      <div className={styles.leftBar}>
        <MessagesLeftBar onSelectUser={handleSelectUser} />
      </div>

      <div className={styles.chat}>
        {selectedUser ? (
          <Chat user={selectedUser} onBack={handleBack} />
        ) : (
          <ChatComponent />
        )}
      </div>

      <div className={styles.profileArea}></div>
    </div>
  );
};

export default MessagesPage;
