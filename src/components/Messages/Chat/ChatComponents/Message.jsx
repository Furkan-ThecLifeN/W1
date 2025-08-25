// src/components/Chat/Message.jsx

import React, { useState, useRef } from "react";
import styles from "../Chat.module.css";
import { AiFillFileAdd } from "react-icons/ai";
import { FaPlay, FaPause, FaMicrophone } from "react-icons/fa";
import HeartMessage from "./HeartMessage"; // ✅ HeartMessage bileşenini import ediyoruz

const Message = ({ msg, isSender, user, appUser }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Firestore Timestamp nesnesini JavaScript Date nesnesine çeviriyoruz
  const isExpired = msg.expiresAt && msg.expiresAt.toDate() < new Date();

  const messageClass = isSender ? styles.right : styles.left;
  const avatarSrc = isSender
    ? appUser.photoURL || "https://via.placeholder.com/40"
    : user.photoURL || "https://via.placeholder.com/40";

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const renderMessageContent = () => {
    // ✅ Kalp mesajı için yeni kontrolümüz
    if (msg.type === "heart") {
      return <HeartMessage msg={msg} isSender={isSender} />;
    }

    if (isExpired) {
      return (
        <span className={`${styles.messageBubble} ${styles.expiredMessage}`}>
          Bu mesajın süresi doldu.
        </span>
      );
    }
    switch (msg.type) {
      case "text":
        return (
          <div className={`${styles.messageBubble} ${styles.text}`}>
            {msg.text}
          </div>
        );
      case "file":
        return (
          <a
            href={msg.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.messageBubble} ${styles.file}`}
          >
            <AiFillFileAdd />
            {msg.fileName}
          </a>
        );
      case "audio":
        return (
          <div className={`${styles.messageBubble} ${styles.audio}`}>
            <div className={styles.audioIconWrapper}>
              <FaMicrophone className={styles.voiceIcon} />
            </div>
            <div className={styles.audioControls}>
              <button className={styles.playPauseBtn} onClick={togglePlay}>
                {isPlaying ? <FaPause /> : <FaPlay />}
              </button>
              <audio
                ref={audioRef}
                src={msg.url}
                onEnded={() => setIsPlaying(false)}
                hidden
              />
              <span className={styles.audioDuration}>Sesli Mesaj</span>
            </div>
          </div>
        );
      default:
        return (
          <div className={`${styles.messageBubble} ${styles.text}`}>
            Bilinmeyen mesaj türü.
          </div>
        );
    }
  };

  return (
    <div className={`${styles.messageRow} ${messageClass}`}>
      {/* Avatar: artık tüm alıcı mesajlarında gösteriliyor */}
      {!isSender && user && (
        <img
          src={avatarSrc}
          alt={user.username || "Kullanıcı"}
          className={styles.userAvatar}
        />
      )}
      {renderMessageContent()}
    </div>
  );
};

export default Message;
