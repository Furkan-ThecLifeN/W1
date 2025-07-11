import React from "react";
import styles from "./ActiveUsers.module.css";

const ActiveUsers = ({ users }) => {
  return (
    <div className={styles.wrapper}>
      <h3>Aktif Kullanıcılar</h3>
      <div className={styles.list}>
        {users.map((user) => (
          <div key={user.id} className={styles.user}>
            <img src={user.avatar} alt={user.name} />
            <span
              className={`${styles.status} ${styles[user.status]}`}
              title={user.status}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveUsers;
