import React, { useState } from "react";
import styles from "./ChannelsComponent.module.css";
import ChannelSidebar from "./ChannelSidebar/ChannelSidebar";
import ChatArea from "./ChannelsChatArea/ChatArea";
import VoiceChannelWidget from "../VoiceChannelWidget/VoiceChannelWidget";
import VoCentraUserCard from "./VocentraUserCard/VocentraUserCard";

const ChannelsComponent = () => {
  const [activeTextChannel, setActiveTextChannel] = useState(null);

  const channelsexample = {
    text: [
      { id: 1, name: "genel-sohbet", unread: true },
      { id: 2, name: "duyurular", unread: false },
      { id: 3, name: "tasarım-fikirleri", unread: false },
      { id: 4, name: "yardım-merkezi", unread: true },
    ],
    voice: [
      { id: 5, name: "Genel Ses", users: 5, maxUsers: 10 },
      { id: 6, name: "Müzik Odası", users: 2, maxUsers: 5 },
      { id: 7, name: "Oyun Odası", users: 8, maxUsers: 12 },
    ],
  };

  return (
    <div className={styles.appContainer}>
      <div className={styles.sidebarWrapper}>
        <ChannelSidebar
          channelsexample={channelsexample}
          setActiveTextChannel={setActiveTextChannel}
          activeTextChannel={activeTextChannel}
        />
      </div>

      <div className={styles.chatWrapper}>
        {activeTextChannel ? (
          <ChatArea channel={activeTextChannel} channelName={activeTextChannel?.name} />
        ) : (
          <div className={styles.welcomeScreen}>
            <div className={styles.welcomeContent}>
              <h2>Premium Sohbete Hoş Geldiniz</h2>
              <p>Başlamak için soldaki kanallardan birini seçin</p>
            </div>
          </div>
        )}
      </div>

      <div className={styles.rightPaddingArea}>
        <VoiceChannelWidget
          userName="Furkan ThecLifeN"
          channelName="Ses Kanalı"
          serverName="W1 Communication"
        />
        <VoCentraUserCard />
      </div>
    </div>
  );
};

export default ChannelsComponent;
