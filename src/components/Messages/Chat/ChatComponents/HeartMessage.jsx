import React from 'react';
import styles from "../Chat.module.css";
import { FaHeart } from "react-icons/fa";

const HeartMessage = ({ msg, isSender, user }) => {
  const messageClass = isSender ? styles.senderHeartMessage : styles.receiverHeartMessage;

  return (
    <div className={`${styles.message} ${messageClass}`}>
      {/* Avatar: sadece alıcı için göster */}
      {!isSender && user && (
        <img
          src={user.photoURL || 'https://via.placeholder.com/40'}
          alt={user.username || 'Kullanıcı'}
          className={styles.userAvatar}
        />
      )}

      <div className={styles.heartMessageContent}>
        <p className={styles.heartMessageText}>{msg.text}</p>
      </div>
    </div>
  );
};

export default HeartMessage;
