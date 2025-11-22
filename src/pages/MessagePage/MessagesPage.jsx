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
import PublicAccessWrapper from "../../components/PublicAccessWrapper/PublicAccessWrapper";

const MessagesPage = () => {
  // GÜNCELLEME 1: 'setState' yerine 'setSelectedUser' çekiyoruz.
  // Eğer store'unuzda bu fonksiyonun adı farklıysa (örn: setCurrentUser), onu buraya yazın.
  const { selectedUser, conversations, isLoaded, loading, setSelectedUser } = useMessagesStore();
  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const content = (
    <>
      {isMobile ? (
        <>
          <MessagesMobile />
          <BottomNav />
        </>
      ) : (
        <div className={styles.wrapper}>
          <Sidebar />
          <div className={styles.page}>
            <aside className={styles.leftBar}>
              {/* GÜNCELLEME 2: setState({...}) yerine doğrudan setSelectedUser(user) kullanıyoruz */}
              <MessagesLeftBar onSelectUser={(user) => setSelectedUser(user)} />
            </aside>

            <main className={styles.chat}>
              {selectedUser ? (
                // GÜNCELLEME 3: Geri tuşuna basıldığında kullanıcıyı null yapıyoruz
                <Chat 
                  user={selectedUser} 
                  onBack={() => setSelectedUser(null)} 
                />
              ) : (
                <ChatComponent conversations={conversations} />
              )}
            </main>

            <section className={styles.rightBar}>
              {selectedUser ? <MessagesRightBar /> : <RightBar />}
            </section>
          </div>
        </div>
      )}
    </>
  );

  return (
    <PublicAccessWrapper loginMessage="Mesajlara erişmek için giriş yapmanız gerekiyor.">
      {content}
    </PublicAccessWrapper>
  );
};

export default MessagesPage;