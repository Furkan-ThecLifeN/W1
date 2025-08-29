// src/components/Chat/ChatComponents/Message.jsx

import React, { useState, useRef } from "react";
import styles from "../Chat.module.css";
import { AiFillFileAdd } from "react-icons/ai";
import { FaPlay, FaPause, FaMicrophone, FaDownload } from "react-icons/fa";
import HeartMessage from "./HeartMessage";

const Message = ({ msg, isSender, user, appUser }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMediaError, setIsMediaError] = useState(false);

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

  const handleMediaError = () => {
    setIsMediaError(true);
  };

  const renderMessageContent = () => {
    if (msg.type === "heart") return <HeartMessage msg={msg} />;

    // Medya hatalarını (silinmiş dosyalar) burada kontrol et
    if (isMediaError) {
      return (
        <div className={`${styles.messageBubble} ${styles.text}`}>
          <p>⚠️ Mesaj içeriğine erişim sonlanmıştır.</p>
        </div>
      );
    }

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
            <a href={msg.url} target="_blank" rel="noopener noreferrer">
              <img
                src={msg.url}
                alt="Gönderilen fotoğraf"
                className={styles.uploadedImage}
                onError={handleMediaError}
              />
            </a>
          </div>
        );

      case "file":
        return (
          <div className={`${styles.messageBubble} ${styles.file}`}>
            <AiFillFileAdd className={styles.fileIcon} />
            <a
              href={msg.url}
              download={msg.fileName}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.downloadLink}
            >
              <p>{msg.fileName}</p>
            </a>
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