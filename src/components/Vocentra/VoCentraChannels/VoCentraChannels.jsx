import React, { useState } from "react";
import styles from "./VoCentraChannels.module.css";
import ChannelSidebar from "./ChannelSidebar/ChannelSidebar";
import ChatArea from "./ChannelsChatArea/ChatArea";
import VoiceChannelWidget from "../VoiceChannelWidget/VoiceChannelWidget";
import VoCentraUserCard from "../VoCentraUserCard/VoCentraUserCard";

const VoCentraChannels = () => {
  const [currentChannel, setCurrentChannel] = useState(null);

  const server = {
    name: "Premium Sunucu",
    currentUser: {
      name: "Furkan",
      tag: "1234",
      avatar: "https://i.pravatar.cc/150?img=3",
    },
  };

  const channels = {
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

     const roles = [
    { name: 'Admin', color: '#ed4245' },
    { name: 'Moderator', color: '#5865f2' },
    { name: 'VIP', color: '#eb459e' },
    { name: 'Member', color: '#57f287' }
  ];

  const users = [
    {
      id: 1,
      name: 'Jane Doe',
      avatar: 'https://i.pravatar.cc/150?img=1',
      role: 'Admin',
      status: 'active',
      activity: {
        type: 'music',
        title: 'Bohemian Rhapsody - Queen'
      }
    },
    {
      id: 2,
      name: 'John Smith',
      avatar: 'https://i.pravatar.cc/150?img=5',
      role: 'Moderator',
      status: 'busy',
      activity: {
        type: 'game',
        game: 'Valorant',
        duration: '2h 45m'
      }
    },
    {
      id: 3,
      name: 'Alex Johnson',
      avatar: 'https://i.pravatar.cc/150?img=9',
      role: 'VIP',
      status: 'inactive',
      badge: 'PRO',
      activity: {
        type: 'music',
        title: 'Blinding Lights - The Weeknd'
      }
    },
    {
      id: 4,
      name: 'Sarah Williams',
      avatar: 'https://i.pravatar.cc/150?img=12',
      role: 'Member',
      status: 'active',
      activity: {
        type: 'game',
        game: 'Minecraft',
        duration: '1h 30m'
      }
    }
  ];

  const channel = {
    id: 1,
    name: "genel-sohbet",
    type: "text",
    topic: "Genel konular için sohbet kanalı",
  };

  const messages = [
    {
      id: 1,
      text: "Merhaba arkadaşlar, nasılsınız?",
      timestamp: new Date(),
      author: {
        name: "Ahmet",
        avatar: "https://i.pravatar.cc/150?img=5",
      },
    },
    {
      id: 2,
      text: "İyiyim teşekkürler, sen nasılsın?",
      timestamp: new Date(),
      author: {
        name: "Ayşe",
        avatar: "https://i.pravatar.cc/150?img=6",
      },
    },
    {
      id: 3,
      text: "Bu yeni tasarım harika görünüyor!",
      timestamp: new Date(),
      author: {
        name: "Mehmet",
        avatar: "https://i.pravatar.cc/150?img=11",
      },
    },
  ];

  return (
    <div className={styles.appContainer}>
      <div className={styles.sidebarWrapper}>
        <ChannelSidebar
          server={server}
          channels={channels}
          onChannelSelect={setCurrentChannel}
        />
      </div>

      <div className={styles.chatWrapper}>
        {currentChannel ? (
          <ChatArea channel={channel} messages={messages} />
        ) : (
          <div className={styles.welcomeScreen}>
            <div className={styles.welcomeContent}>
              <h2>Premium Sohbete Hoş Geldiniz</h2>
              <p>Başlamak için soldaki kanallardan birini seçin</p>
            </div>
          </div>
        )}
      </div>

      {/* Sağda boşluk bırakmak için (isteğe bağlı görsel genişlik) */}
      <div className={styles.rightPaddingArea}>
         <VoiceChannelWidget 
        userName="Furkan ThecLifeN"
        channelName="Ses Kanalı"
        serverName="W1 Communication"
      />
      <VoCentraUserCard users={users} roles={roles} />
      </div>
    </div>
  );
};

export default VoCentraChannels;
