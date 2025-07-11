import React, { useState } from "react";
import styles from "./MessagesSection.module.css";
import SearchBar from "./SearchBar/SearchBar";
import ActiveUsers from "./ActiveUsers/ActiveUsers";
import UserList from "./UserList/UserList";
import ChatHeader from "./ChatHeader/ChatHeader";
import ChatWindow from "./ChatWindow/ChatWindow";
import UserProfileCard from "./UserProfileCard/UserProfileCard";
import avatar from "../../assets/W1.png";

const usersMock = [
  {
    id: 1,
    name: "Zeynep",
    avatar,
    status: "online",
    lastMessage: "Bugün görüşelim mi?",
    time: "12:45",
    posts: 34,
    followers: 1250,
    following: 300,
    bio: "Frontend geliştirici ve kahve tutkunu ☕",
  },
  {
    id: 2,
    name: "Mert",
    avatar,
    status: "idle",
    lastMessage: "Tamamdır, haber veririm.",
    time: "Dün",
    posts: 12,
    followers: 430,
    following: 220,
    bio: "ReactJS • NodeJS • Takım oyuncusu",
  },
  {
    id: 3,
    name: "Selin",
    avatar,
    status: "busy",
    lastMessage: "Teşekkür ederim!",
    time: "3 gün önce",
    posts: 78,
    followers: 3000,
    following: 180,
    bio: "Tasarım benim işim 🎨 | UI/UX",
  },
];

const MessagesPage = () => {
  const [search, setSearch] = useState("");
  const [activeUser, setActiveUser] = useState(usersMock[0]);

  const filteredUsers = usersMock.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.page}>
      <div className={styles.sidebar}>
        <div className={styles.header}>
          <h2 className={styles.messagesTitle}>Mesajlar</h2>
          <SearchBar value={search} onChange={setSearch} />
        </div>
        <ActiveUsers users={usersMock} />
        <UserList users={filteredUsers} onSelect={setActiveUser} />
      </div>

      <div className={styles.chatArea}>
        <ChatHeader user={activeUser} />
        <ChatWindow currentUser="Ben" otherUser={activeUser} />
      </div>

      <div className={styles.profileArea}>
        <UserProfileCard user={activeUser} />
      </div>
    </div>
  );
};

export default MessagesPage;
