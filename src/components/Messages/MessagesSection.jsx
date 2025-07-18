import React from "react";
import styles from "./MessagesSection.module.css";
import Chat from "./Chat/Chat";
import MessagesLeftBar from "./MessagesLeftBar/MessagesLeftBar";

const MessagesPage = () => {

  return (
    <div className={styles.page}>
      <div className={styles.leftBar}>
        <MessagesLeftBar />
      </div>

      <div className={styles.chatArea}>
        <Chat />
      </div>

      <div className={styles.profileArea}>
        
     </div>
    </div>
  );
};

export default MessagesPage;
