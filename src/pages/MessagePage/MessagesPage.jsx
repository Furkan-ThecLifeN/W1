import React, { useEffect, useState } from "react";
import styles from "./MessagesPage.module.css";
import MessagesLeftBar from "../../components/Messages/MessagesLeftBar/MessagesLeftBar";
import Chat from "../../components/Messages/Chat/Chat";
import ChatComponent from "../../components/Messages/Chat/ChatComponent";
import MessagesRightBar from "../../components/Messages/MessagesRightBar/MessagesRightBar";
import RightBar from "../../components/Messages/MessagesRightBar/RightBar";
import Sidebar from "../../components/LeftSideBar/Sidebar";
import MessagesMobile from "../../components/Messages/MessagesMobile/MessagesMobile";
import BottomNav from "../../components/BottomNav/BottomNav";
import { useMessagesStore } from "../../Store/useMessagesStore";
import axios from "axios";

const MessagesPage = () => {
  const { selectedUser, conversations, isLoaded, loading, setState } = useMessagesStore();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // ekran boyutunu takip et
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);



  if (isMobile) {
    return (
      <>
        <MessagesMobile />
        <BottomNav />
      </>
    );
  }

  return (
    <div className={styles.wrapper}>
      <Sidebar />
      <div className={styles.page}>
        <aside className={styles.leftBar}>
          <MessagesLeftBar onSelectUser={(user) => setState({ selectedUser: user })} />
        </aside>

        <main className={styles.chat}>
          {selectedUser ? (
            <Chat user={selectedUser} onBack={() => setState({ selectedUser: null })} />
          ) : (
            <ChatComponent conversations={conversations} />
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
