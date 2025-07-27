import React from "react";
import styles from "./UserCard.module.css";

const UserCard = ({ user, onToggleFollow, onRemove }) => {
  return (
    <div className={styles.card}>
      <div className={styles.left}>
        <div className={styles.avatar}>
          {user.name.slice(0, 1).toUpperCase()}
        </div>

        <div className={styles.userInfo}>
          <p className={styles.username}>{user.name}</p>
          <p className={styles.bio}>{user.bio}</p>
        </div>
      </div>
      <div className={styles.actions}>
        <button
          onClick={onToggleFollow}
          className={`${styles.followBtn} ${
            user.following ? styles.following : styles.follow
          }`}
        >
          {user.following ? "Takibi Bırak" : "Takip Et"}
        </button>
        {user.following && (
          <button onClick={onRemove} className={styles.removeBtn}>
            Takipten Çıkar
          </button>
        )}
      </div>
    </div>
  );
};

export default UserCard;
