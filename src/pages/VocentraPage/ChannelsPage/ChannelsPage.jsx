import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // ✅ URL'den ID okumak için
import { useServerStore } from "../../../Store/useServerStore"; 
import Sidebar from "../../../components/LeftSideBar/Sidebar";
import BottomNav from "../../../components/BottomNav/BottomNav";
import ChannelSidebar from "../../../components/Voice/ChannelSidebar/ChannelSidebar";
import ChatArea from "../../../components/Voice/ChatArea/ChatArea";
import MemberSidebar from "../../../components/Voice/MemberSidebar/MemberSidebar";
import styles from "./ChannelsPage.module.css";
import { getAuth } from "firebase/auth"; // ✅ Auth kontrolü için

const ChannelsPage = () => {
  const { serverId } = useParams(); // ✅ URL'den Server ID'yi al
  
  // Store'dan fonksiyonları ve verileri çek
  const { 
    servers, 
    activeServerId, 
    serverDetails, 
    fetchUserServers, 
    fetchServerDetails, 
    setActiveServer 
  } = useServerStore();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [activeTextChannel, setActiveTextChannel] = useState(null);

  // 1. EĞER SAYFA YENİLENDİYSE VERİYİ TEKRAR ÇEK
  useEffect(() => {
    const auth = getAuth();
    // Auth durumunu bekle (Firebase user yüklensin)
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // A) Eğer Sunucu Listesi (Lite) yoksa çek
        if (servers.length === 0) {
          fetchUserServers();
        }
        
        // B) Eğer URL'de ID varsa, Detayları (Heavy) çek
        if (serverId) {
          setActiveServer(serverId); // Store'da aktif ID'yi güncelle
          fetchServerDetails(serverId); // Detayları çek
        }
      }
    });
    return () => unsubscribe();
  }, [serverId, servers.length, fetchUserServers, fetchServerDetails, setActiveServer]);

  // 2. Aktif Sunucu Bilgilerini Bul
  const activeServerLite = servers.find(s => s.id === serverId) || { name: "Yükleniyor...", img: "" };
  const activeServerHeavy = serverDetails[serverId] || { channels: [] };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 3. Varsayılan Kanalı Seç
  useEffect(() => {
    if (activeServerHeavy.channels && activeServerHeavy.channels.length > 0) {
      // Eğer kanal seçili değilse, ilk metin kanalını seç
      if (!activeTextChannel) {
        const firstText = activeServerHeavy.channels.find(c => c.type === 'text');
        if (firstText) setActiveTextChannel(firstText);
      }
    }
  }, [activeServerHeavy, activeTextChannel]);

  // Yükleniyor durumu (Veri gelene kadar)
  if (!activeServerLite.id && !activeServerHeavy.channels) {
    return (
       <div className={styles.pageLayout}>
        {!isMobile && <aside className={styles.appSidebar}><Sidebar /></aside>}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#888" }}>
          Yükleniyor...
        </div>
      </div>
    );
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
          
          {/* Kanal Listesi */}
          <ChannelSidebar
            serverInfo={activeServerLite}
            textChannels={activeServerHeavy.channels ? activeServerHeavy.channels.filter(c => c.type === 'text') : []}
            voiceChannels={activeServerHeavy.channels ? activeServerHeavy.channels.filter(c => c.type === 'voice') : []}
            activeChannelId={activeTextChannel?.channelId || activeTextChannel?.id}
            onChannelSelect={setActiveTextChannel}
          />

          {/* Chat Alanı */}
          <ChatArea
            channelName={activeTextChannel?.name}
            channelId={activeTextChannel?.channelId || activeTextChannel?.id}
          />

          {/* Üye Listesi */}
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