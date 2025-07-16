import React, { useState } from "react";
import styles from "./CloseFriends.module.css";
import { FiUserCheck, FiUserPlus } from "react-icons/fi";

const dummyUsers = [
  {
    id: 1,
    name: "Alice",
    isClose: true,
    avatar:
      "https://i.pinimg.com/736x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg",
  },
  {
    id: 2,
    name: "Bob",
    isClose: false,
    avatar:
      "https://i.pinimg.com/736x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg",
  },
  {
    id: 3,
    name: "Charlie",
    isClose: true,
    avatar:
      "https://i.pinimg.com/736x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg",
  },
  {
    id: 4,
    name: "Diana",
    isClose: false,
    avatar:
      "https://i.pinimg.com/736x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg",
  },
];

const CloseFriends = () => {
  const [users, setUsers] = useState(dummyUsers);

  const toggleCloseFriend = (id) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id ? { ...user, isClose: !user.isClose } : user
      )
    );
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>Close Friends</h2>
      <p className={styles.subtext}>
        Mark people as close friends to give them access to your special
        content.
      </p>

      <div className={styles.grid}>
        {users.map((user) => (
          <div
            key={user.id}
            className={`${styles.card} ${user.isClose ? styles.close : ""}`}
          >
            <div className={styles.cardHeader}>
              <img
                src={user.avatar}
                alt={user.name}
                className={styles.avatar}
              />
              <h4 className={styles.name}>{user.name}</h4>
            </div>
            <button
              className={styles.action}
              onClick={() => toggleCloseFriend(user.id)}
            >
              {user.isClose ? (
                <>
                  <FiUserCheck /> Close Friend
                </>
              ) : (
                <>
                  <FiUserPlus /> Add to Close
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CloseFriends;
