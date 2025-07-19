import React, { useState, useEffect } from "react";
import styles from "./MessagesSection.module.css";
import Chat from "./Chat/Chat";
import MessagesLeftBar from "./MessagesLeftBar/MessagesLeftBar";
import MessagesRightBar from "./MessagesRightBar/MessagesRightBar";
import ChatComponent from "./Chat/ChatComponent";
import RightBar from "./MessagesRightBar/RightBar";
import MessagesMobile from "./MessagesMobile/MessagesMobile";

const MessagesSection = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className={styles.wrapper}>
      {!isMobile ? (
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
          </div>a

          <div className={styles.rightBar}>
            {selectedUser ? <MessagesRightBar /> : <RightBar />}
          </div>
        </div>
      ) : (
        <div className={styles.mobileOnly}>
          <MessagesMobile />
        </div>
      )}
    </div>
  );
};

export default MessagesSection;
