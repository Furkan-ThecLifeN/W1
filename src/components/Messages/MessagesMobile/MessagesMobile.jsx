import React, { useState } from "react";
import styles from "./MessagesMobile.module.css";
import { IoSearchSharp } from "react-icons/io5";
import { FaMicrophone } from "react-icons/fa";
import StoryBar from "../../StoryBar/StoryBar";
import Chat from "../Chat/Chat";

const dummyUsers = [
  {
    id: 1,
    name: "John Doe",
    lastMessage: "Hey, how are you?",
    time: "2m ago",
    profileImage: "https://i.pravatar.cc/40?img=1",
  },
  {
    id: 2,
    name: "Jane Smith",
    lastMessage: "Let's catch up tomorrow.",
    time: "1h ago",
    profileImage: "https://i.pravatar.cc/40?img=2",
  },
  {
    id: 3,
    name: "Ali Veli",
    lastMessage: "Tamamdır, bekliyorum.",
    time: "3h ago",
    profileImage: "https://i.pravatar.cc/40?img=3",
  },
];

const MessagesMobile = () => {
  const [selectedUser, setSelectedUser] = useState(null);

  if (selectedUser) {
    // Seçilen kullanıcı varsa sadece Chat göster, onBack ile kullanıcı listesine dön
    return <Chat user={selectedUser} onBack={() => setSelectedUser(null)} />;
  }

  const currentUser = {
    id: 1,
    name: "You",
    img: "https://randomuser.me/api/portraits/men/10.jpg",
  };

  // Kullanıcı seçilmemişse mesaj listesi ve story bar göster
  return (
    <div className={styles.MessagesLeftMobile}>
      <div className={styles.left_SearchInputBox}>
        <IoSearchSharp />
        <input type="text" placeholder="Search messages..." />
        <FaMicrophone />
      </div>

      <div className={styles.storyWrapper}>
        <StoryBar currentUser={currentUser} />{" "}
      </div>

      <ul className={styles.usersMessagesBox}>
        {dummyUsers.map((user, index) => (
          <li
            key={`${user.id}-${index}`}
            className={styles.userCard}
            onClick={() => setSelectedUser(user)}
          >
            <div className={styles.userProfileBox}>
              <div className={styles.userProfileBackground}>
                <img src={user.profileImage} alt={user.name} />
              </div>
            </div>
            <div className={styles.userMessageInfo}>
              <p className={styles.userName}>{user.name}</p>
              <p className={styles.lastMessage}>{user.lastMessage}</p>
            </div>
            <div className={styles.messageTime}>{user.time}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MessagesMobile;
