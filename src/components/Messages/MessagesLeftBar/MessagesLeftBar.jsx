import React from 'react';
import styles from "./MessagesLeftBar.module.css";
import { IoSearchSharp } from "react-icons/io5";
import { FaMicrophone } from "react-icons/fa";


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
  }, {
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

const MessagesLeftBar = () => {
  return (
    <div className={styles.MessagesLeftBar}>
      <div className={styles.left_SearchInputBox}>
        <IoSearchSharp />
        <input type="text" placeholder="Search messages..." />
        <FaMicrophone />
      </div>

      <ul className={styles.usersMessagesBox}>
        {dummyUsers.map(user => (
          <li key={user.id} className={styles.userCard}>
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

export default MessagesLeftBar;
