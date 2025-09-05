import React, { useState } from "react";
import {
  FiHeart,
  FiMessageCircle,
  FiBookmark,
  FiSend,
  FiMoreVertical,
} from "react-icons/fi";
import { FaHeart, FaBookmark } from "react-icons/fa";
import styles from "./PostVideoCard.module.css";
import { motion, AnimatePresence } from "framer-motion";

const getYouTubeEmbedUrl = (url) => {
  const videoIdMatch = url.match(/(?:\/shorts\/|youtu\.be\/|v=)([^&?/]+)/);
  if (videoIdMatch && videoIdMatch[1]) {
    const params = new URLSearchParams({
      autoplay: 1,
      muted: 0,
      loop: 1,
      controls: 1,
      playlist: videoIdMatch[1],
      modestbranding: 1,
    });
    return `https://www.youtube.com/embed/${videoIdMatch[1]}?${params.toString()}`;
  }
  return null;
};

// Prop isimlerini düzeltiyoruz: 'content' yerine 'description' kullanıyoruz.
export default function PostVideoCard({
  videoSrc,
  description, // <-- Artık 'description' prop'unu alıyoruz
  username,
  userProfileImage,
}) {
  const [liked, setLiked] = useState(false);
  const [doubleTap, setDoubleTap] = useState(false);
  const [saved, setSaved] = useState(false);
  const [followed, setFollowed] = useState(false);

  const handleDoubleClick = () => {
    setLiked(true);
    setDoubleTap(true);
    setTimeout(() => setDoubleTap(false), 1000);
  };

  const handleLikeClick = () => setLiked((prev) => !prev);
  const handleSaveClick = () => setSaved((prev) => !prev);

  const embedUrl = getYouTubeEmbedUrl(videoSrc);
  if (!embedUrl) {
    console.error("Geçersiz video URL'si:", videoSrc);
    return null;
  }

  return (
    <div className={styles.card}>
      <div className={styles.video_container} onDoubleClick={handleDoubleClick}>
        <iframe
          className={styles.video_iframe}
          src={embedUrl}
          title="YouTube Shorts video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>

        <AnimatePresence>
          {doubleTap && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className={styles.heart_double_tap}
            >
              <FaHeart />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className={styles.content}>
        <div className={styles.info_box}>
          <div className={styles.info_top}>
            <div className={styles.profile}>
              <img
                src={userProfileImage || "https://i.pravatar.cc/48"}
                alt={username || "Anonim Kullanıcı"}
                className={styles.avatar}
              />
              <span className={styles.username}>{username || "Anonim Kullanıcı"}</span>
            </div>
            <button
              onClick={() => setFollowed(!followed)}
              className={styles.follow_btn}
            >
              {followed ? "Takibi Bırak" : "Takip Et"}
            </button>
          </div>
          <div className={styles.description}>{description}</div> {/* 'content' yerine 'description' kullanıyoruz */}
        </div>

        <div className={styles.actions}>
          <div className={styles.icon_box} onClick={handleLikeClick}>
            {liked ? (
              <FaHeart className={`${styles.icon} ${styles.liked}`} />
            ) : (
              <FiHeart className={styles.icon} />
            )}
          </div>
          <FiMessageCircle className={styles.icon} />
          <div className={styles.icon_box} onClick={handleSaveClick}>
            {saved ? (
              <FaBookmark className={`${styles.icon} ${styles.saved}`} />
            ) : (
              <FiBookmark className={styles.icon} />
            )}
          </div>
          <FiSend className={styles.icon} />
          <FiMoreVertical className={styles.icon} />
        </div>
      </div>
    </div>
  );
}