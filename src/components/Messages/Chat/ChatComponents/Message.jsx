// src/components/Chat/ChatComponents/Message.jsx

import React, { useState, useRef } from "react";
import styles from "../Chat.module.css";
import { AiFillFileAdd } from "react-icons/ai";
import { FaPlay, FaPause, FaMicrophone, FaDownload } from "react-icons/fa";
import HeartMessage from "./HeartMessage";

const Message = ({ msg, isSender, user, appUser, onImageClick }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

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
    if (msg.type === "heart") return <HeartMessage msg={msg} />;

    switch (msg.type) {
      case "text":
        return (
          <div className={`${styles.messageBubble} ${styles.text}`}>
            {msg.text}
          </div>
        );

      case "image":
        return (
          <div className={`${styles.messageBubble} ${styles.image}`}>
            <img
              src={msg.url}
              alt={msg.fileName || "Resim"}
              onClick={() => onImageClick(msg.url)}
              className={styles.chatImage}
            />
          </div>
        );

      case "file":
        // Dosya indirme URL'si için backend adresini ekledik
        const fileDownloadUrl = `http://localhost:3001${msg.url}`;
        return (
          <a
            href={fileDownloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.messageBubble} ${styles.file}`}
          >
            <AiFillFileAdd />
            <span>{msg.fileName}</span>
            <FaDownload className={styles.downloadIcon} />
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
              <a
                href={msg.url}
                download={msg.fileName}
                className={styles.downloadLink}
              >
                <FaDownload />
              </a>
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
      {!isSender && user && (
        <img
          src={avatarSrc}
          alt={user.username || "User"}
          className={styles.userAvatar}
        />
      )}
      {renderMessageContent()}
    </div>
  );
};

export default Message;
