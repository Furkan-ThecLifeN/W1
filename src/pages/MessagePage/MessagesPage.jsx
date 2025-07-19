import React, { useState } from "react";
import styles from "./MessagesPage.module.css";
import MessagesLeftBar from "../../components/Messages/MessagesLeftBar/MessagesLeftBar";
import Chat from "../../components/Messages/Chat/Chat";
import ChatComponent from "../../components/Messages/Chat/ChatComponent";
import MessagesRightBar from "../../components/Messages/MessagesRightBar/MessagesRightBar";
import RightBar from "../../components/Messages/MessagesRightBar/RightBar";
import Sidebar from "../../components/LeftSideBar/Sidebar"; 

const MessagesPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className={styles.wrapper}>
      <Sidebar />
      <div className={styles.page}>
        <aside className={styles.leftBar}>
          <MessagesLeftBar onSelectUser={setSelectedUser} />
        </aside>

        <main className={styles.chat}>
          {selectedUser ? (
            <Chat user={selectedUser} onBack={() => setSelectedUser(null)} />
          ) : (
            <ChatComponent />
          )}
        </main>

        <section className={styles.rightBar}>
          {selectedUser ? <MessagesRightBar /> : <RightBar />}
        </section>
      </div>
    </div>
  );
};

export default MessagesPage;
