import React, { useState, useEffect } from "react";
import styles from "./MessagesPage.module.css";
import Chat from "../components/Chat/Chat";
import MessagesLeftBar from "../components/MessagesLeftBar/MessagesLeftBar";
import ChatComponent from "../components/Chat/ChatComponent";
import Sidebar from "../components/LeftSideBar/Sidebar";
import MessagesRightBar from "../components/MessagesRightBar/MessagesRightBar";
import RightBar from "../components/MessagesRightBar/RightBar";
import BottomNav from "../components/BottomNav/BottomNav";
import { useMessagesStore } from "../../Store/useMessagesStore";
import Footer from "../Footer/Footer";

const MessagesPage = () => {
  const { selectedUser, setState } = useMessagesStore();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSelectUser = (user) => setState({ selectedUser: user });
  const handleBack = () => setState({ selectedUser: null });

  if (isMobile) {
    return (
      <>
        {/* Mobil görünüm için kendi MessagesMobile component’in olabilir */}
        <ChatComponent />
        <BottomNav />
      </>
    );
  }

  return (
    <div className={styles.wrapper}>
      <Sidebar />
      <div className={styles.page}>
        <aside className={styles.leftBar}>
          <MessagesLeftBar onSelectUser={handleSelectUser} />
        </aside>

        <main className={styles.chat}>
          {selectedUser ? (
            <Chat user={selectedUser} onBack={handleBack} />
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
