// src/components/Messages/MessagesMobile/MessagesMobile.jsx
import React, { useState } from "react";
import styles from "./MessagesMobile.module.css";
import MessagesLeftBar from "../MessagesLeftBar/MessagesLeftBar";
import Chat from "../Chat/Chat";
import StoryBar from "../../StoryBar/StoryBar";
import { useUser } from "../../../context/UserContext";

const MessagesMobile = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const { currentUser } = useUser();

  // If a user is selected, show the Chat component
  if (selectedUser) {
    return <Chat user={selectedUser} onBack={() => setSelectedUser(null)} />;
  }

  // If no user is selected, show the StoryBar and MessagesLeftBar
  return (
    <div className={styles.MessagesMobile}>
      {/* StoryBar is specific to the mobile view */}
      <div className={styles.storyWrapper}>
        <StoryBar currentUser={currentUser} />
      </div>

      {/* MessagesLeftBar handles user selection for both mobile and desktop */}
      <MessagesLeftBar onSelectUser={setSelectedUser} />
    </div>
  );
};

export default MessagesMobile;