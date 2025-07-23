import React, { useState } from "react";
import styles from "./Vocentra.module.css";
import ServerList from "./VocentraServerList/VocentraServerList";
import VoCentraRoster from "./VocentraRoster/VocentraRoster";
import VoiceChannelWidget from "./VoiceChannelWidget/VoiceChannelWidgets";
import VoCentraUserCard from "./VocentraUserCard/VocentraUserCards";

const Vocentra = () => {
  const [selectedUser, setSelectedUser] = useState(null);

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

  const server = {
    name: "React Developers TR",
    currentUser: {
      name: "KodYazarı",
      tag: "1234",
      avatar: "https://i.pravatar.cc/150?img=5"
    }
  };

  const channels = {
    text: [
      { id: 1, name: "genel", unread: true },
      { id: 2, name: "react-öğreniyorum", unread: false },
      { id: 3, name: "projeler", unread: false },
      { id: 4, name: "yardım", unread: true }
    ],
    voice: [
      { id: 5, name: "Genel Sohbet", users: 3, maxUsers: 10 },
      { id: 6, name: "Çalışma Odası", users: 1, maxUsers: 5 },
      { id: 7, name: "Müzik Dinleme", users: 2, maxUsers: 8 }
    ]
  };

  const currentChannel = {
    name: "genel",
    topic: "React ile ilgili genel sohbetler"
  };

  const messages = [
    {
      author: {
        name: "Ahmet",
        avatar: "https://i.pravatar.cc/150?img=3",
        roleColor: "#5865f2"
      },
      text: "Merhaba arkadaşlar! Bugün React Context API üzerine konuşalım mı?",
      timestamp: "2023-05-15T10:30:00"
    },
    {
      author: {
        name: "Mehmet",
        avatar: "https://i.pravatar.cc/150?img=7",
        roleColor: "#ed4245"
      },
      text: "Tabii ki! Context API ile state yönetimi gerçekten işleri kolaylaştırıyor.",
      timestamp: "2023-05-15T10:32:00"
    }
  ];

  return (
    <div className={styles.Vocentra}>
      <div className={styles.VoicentraleftBar}>
        

        <ServerList onSelectUser={setSelectedUser} />
      </div>

      <div className={styles.Vocentra_main}>
        <VoCentraRoster />
      </div>

      <div className={styles.VocentraRightBar}>
        <VoiceChannelWidget 
        userName="Furkan ThecLifeN"
        channelName="Ses Kanalı"
        serverName="W1 Communication"
      />
{/*       <VoCentraUserCard users={users} roles={roles} />
 */}      </div>
    </div>
  );
};

export default Vocentra;
