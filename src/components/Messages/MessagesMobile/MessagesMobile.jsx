// components/MessagesMobile/MessagesMobile.jsx
import React, { useEffect, useState } from "react";
import styles from "./MessagesMobile.module.css";
import ChatWindow from "../ChatWindow/ChatWindow";
import avatar from "../../../assets/W1.png";
import ActiveUsers from "../ActiveUsers/ActiveUsers";

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

const users = [
  {
    id: 1,
    name: "Zeynep",
    avatar,
    status: "online",
    lastMessage: "Bugün görüşelim mi?",
    time: "12:45",
  },
  {
    id: 2,
    name: "Mert",
    avatar,
    status: "idle",
    lastMessage: "Tamamdır, haber veririm.",
    time: "Dün",
  },
  {
    id: 3,
    name: "Selin",
    avatar,
    status: "busy",
    lastMessage: "Teşekkür ederim!",
    time: "3 gün önce",
  },
];

export default function MessagesMobile({ hideBottomNav }) {
  // Prop ekledik
  const [activeUser, setActiveUser] = useState(null);

  // BottomNav'ı yönetmek için useEffect ekliyoruz
  useEffect(() => {
    if (hideBottomNav) {
      hideBottomNav(!!activeUser); // activeUser varsa (chat view'deysek) true gönder
    }
  }, [activeUser, hideBottomNav]);

  return (
    <div className={styles.container}>
      {!activeUser ? (
        <div className={styles.listView}>
          <h2 className={styles.title}>Mesajlar</h2>
          <ActiveUsers users={usersMock} />

          <ul className={styles.userList}>
            {users.map((user) => (
              <li
                key={user.id}
                className={styles.userItem}
                onClick={() => setActiveUser(user)}
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className={styles.avatar}
                />
                <div className={styles.info}>
                  <span className={styles.name}>{user.name}</span>
                  <span className={styles.preview}>{user.lastMessage}</span>
                </div>
                <span className={styles.time}>{user.time}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className={styles.chatView}>
          <div className={styles.chatHeader}>
            <button
              onClick={() => setActiveUser(null)}
              className={styles.backBtn}
            >
              ◀
            </button>
            <img src={activeUser.avatar} alt="" className={styles.avatar} />
            <span className={styles.name}>{activeUser.name}</span>
          </div>
          <ChatWindow currentUser="Ben" otherUser={activeUser} />
        </div>
      )}
    </div>
  );
}
