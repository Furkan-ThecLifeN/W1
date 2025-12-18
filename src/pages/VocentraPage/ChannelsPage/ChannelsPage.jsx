import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useServerStore } from "../../../Store/useServerStore";
import Sidebar from "../../../components/LeftSideBar/Sidebar";
import BottomNav from "../../../components/BottomNav/BottomNav";
import ChannelSidebar from "../../../components/Voice/ChannelSidebar/ChannelSidebar";
import ChatArea from "../../../components/Voice/ChatArea/ChatArea";
import MemberSidebar from "../../../components/Voice/MemberSidebar/MemberSidebar";
import styles from "./ChannelsPage.module.css";
import { getAuth } from "firebase/auth";

const ChannelsPage = () => {
  const { serverId } = useParams();

  const {
    servers,
    serverDetails,
    fetchUserServers,
    fetchServerDetails,
    setActiveServer,
  } = useServerStore();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [activeTextChannel, setActiveTextChannel] = useState(null);

  // 🔌 1. SOCKET STATE'İ OLUŞTUR
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null); // Ref ile bağlantıyı takip et

  // 🔌 2. SOCKET BAĞLANTISINI KUR (Sadece bir kere)
  useEffect(() => {
    // Eğer zaten bağlıysa tekrar bağlanma
    if (socketRef.current) return;

    // Backend adresin (Localhost ise)
    const wsUrl = "ws://localhost:3001"; // Portunu backend'ine göre ayarla!
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("✅ WebSocket Bağlandı");
      setSocket(ws);
    };

    ws.onclose = () => {
      console.log("❌ WebSocket Koptu");
      setSocket(null);
      socketRef.current = null;
    };

    socketRef.current = ws;

    // Component ölürse bağlantıyı kapat
    return () => {
      if (ws.readyState === 1) ws.close();
    };
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        if (servers.length === 0) fetchUserServers();
        if (serverId) {
          setActiveServer(serverId);
          fetchServerDetails(serverId);
        }
      }
    });
    return () => unsubscribe();
  }, [
    serverId,
    servers.length,
    fetchUserServers,
    fetchServerDetails,
    setActiveServer,
  ]);

  const activeServerLite = servers.find((s) => s.id === serverId) || {
    name: "Yükleniyor...",
    img: "",
  };
  const activeServerHeavy = serverDetails[serverId] || { channels: [] };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (activeServerHeavy.channels && activeServerHeavy.channels.length > 0) {
      if (!activeTextChannel) {
        const firstText = activeServerHeavy.channels.find(
          (c) => c.type === "text"
        );
        if (firstText) setActiveTextChannel(firstText);
      }
    }
  }, [activeServerHeavy, activeTextChannel]);

  if (!activeServerLite.id && !activeServerHeavy.channels) {
    return <div className={styles.pageLayout}>Yükleniyor...</div>;
  }

  return (
    <div className={styles.pageLayout}>
      {!isMobile && (
        <aside className={styles.appSidebar}>
          <Sidebar />
        </aside>
      )}

      <main className={styles.mainStage}>
        <div className={styles.innerStage}>
          {/* 👇 SOCKET PROP OLARAK BURAYA EKLENDİ */}
          <ChannelSidebar
            serverInfo={{
              ...activeServerLite,
              ...activeServerHeavy,
            }}
            textChannels={
              activeServerHeavy.channels
                ? activeServerHeavy.channels.filter((c) => c.type === "text")
                : []
            }
            voiceChannels={
              activeServerHeavy.channels
                ? activeServerHeavy.channels.filter((c) => c.type === "voice")
                : []
            }
            activeChannelId={
              activeTextChannel?.channelId || activeTextChannel?.id
            }
            onChannelSelect={setActiveTextChannel}
            socket={socket}
          />

          <ChatArea
            channelName={activeTextChannel?.name}
            channelId={activeTextChannel?.channelId || activeTextChannel?.id}
          />

          <aside className={styles.rightPanel}>
            <MemberSidebar />
          </aside>
        </div>
      </main>

      {isMobile && (
        <div className={styles.mobileNavWrapper}>
          <BottomNav />
        </div>
      )}
    </div>
  );
};

export default ChannelsPage;
