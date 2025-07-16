import React, { useState } from "react";
import styles from "./BlockedUsers.module.css";
import { FiUserX, FiXCircle } from "react-icons/fi";

const dummyBlockedUsers = [
  { id: 1, name: "john_doe", avatar: "https://i.pinimg.com/736x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg" },
  { id: 2, name: "sarah88", avatar: "https://i.pinimg.com/736x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg" },
  { id: 3, name: "nightwolf", avatar: "https://i.pinimg.com/736x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg" },
];

const BlockedUsers = () => {
  const [blocked, setBlocked] = useState(dummyBlockedUsers);

  const unblockUser = (id) => {
    setBlocked((prev) => prev.filter((user) => user.id !== id));
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>
        <FiUserX /> Blocked Users
      </h2>
      <p className={styles.subtext}>Manage who you've blocked from interacting with you.</p>

      {blocked.length === 0 ? (
        <p className={styles.empty}>You haven’t blocked anyone.</p>
      ) : (
        <div className={styles.list}>
          {blocked.map((user) => (
            <div key={user.id} className={styles.card}>
              <img src={user.avatar} alt={user.name} className={styles.avatar} />
              <div className={styles.info}>
                <span className={styles.username}>@{user.name}</span>
              </div>
              <button className={styles.unblockBtn} onClick={() => unblockUser(user.id)}>
                <FiXCircle /> Unblock
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlockedUsers;
