import React from "react";
import styles from "./UserList.module.css";

const UserList = ({ users }) => {
  return (
    <div className={styles.list}>
      {users.map((user) => (
        <div key={user.id} className={styles.card}>
          <img src={user.avatar} alt={user.name} />
          <div className={styles.info}>
            <div className={styles.nameRow}>
              <span className={styles.name}>{user.name}</span>
              <span className={styles.time}>{user.time}</span>
            </div>
            <p className={styles.message}>{user.lastMessage}</p>
          </div>
          <span
            className={`${styles.dot} ${styles[user.status]}`}
            title={user.status}
          />
        </div>
      ))}
    </div>
  );
};

export default UserList;
