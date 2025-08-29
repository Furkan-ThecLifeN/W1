// src/components/Chat/ChatComponents/Message.jsx

import React, { useState, useRef } from "react";
import styles from "../Chat.module.css";
import ImageViewerModal from "./ImageViewerModal"; // ✅ YENİ: Modal bileşenini import ediyoruz
import { AiFillFileAdd } from "react-icons/ai";
import { FaPlay, FaPause, FaMicrophone, FaDownload } from "react-icons/fa";
import HeartMessage from "./HeartMessage";

const Message = ({ msg, isSender, user, appUser }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMediaError, setIsMediaError] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false); // ✅ YENİ: Resim modalı durumu

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

  // ✅ YENİ: Resim modalını açma
  const openImageModal = () => {
    setIsImageModalOpen(true);
  };

  // ✅ YENİ: Resim modalını kapatma
  const closeImageModal = () => {
    setIsImageModalOpen(false);
  };

  const renderMessageContent = () => {
    if (msg.type === "heart") return <HeartMessage msg={msg} />;

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
            <img
              src={msg.url}
              alt="Gönderilen fotoğraf"
              className={styles.uploadedImageThumbnail} // ✅ GÜNCELLEME: Yeni thumbnail stili
              onClick={openImageModal} // ✅ YENİ: Tıklandığında modalı aç
              onError={handleMediaError}
            />
          </div>
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
    <>
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

      {/* ✅ YENİ: Resim modalını buraya ekliyoruz */}
      {isImageModalOpen && msg.type === "image" && (
        <ImageViewerModal
          imageUrl={msg.url}
          fileName={msg.fileName}
          onClose={closeImageModal}
        />
      )}
    </>
  );
};

export default Message;