import React, { useState } from "react";
import styles from "./MessagesSection.module.css";
import Chat from "./Chat/Chat";
import MessagesLeftBar from "./MessagesLeftBar/MessagesLeftBar";
import ChatComponent from "./Chat/ChatComponent";

const MessagesPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  return (
    <div className={styles.page}>
      <div className={styles.leftBar}>
        <MessagesLeftBar onSelectUser={setSelectedUser} />
      </div>

      <div className={styles.chat}>
        {selectedUser ? (
          <Chat user={selectedUser} onBack={() => setSelectedUser(null)} />
        ) : (
          <ChatComponent />
        )}
      </div>

      <div className={styles.profileArea}></div>
    </div>
  );
};

export default MessagesPage;
