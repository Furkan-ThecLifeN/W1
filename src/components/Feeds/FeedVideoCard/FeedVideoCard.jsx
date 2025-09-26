import React, { useState } from "react";
import {
  FiHeart,
  FiMessageCircle,
  FiBookmark,
  FiSend,
  FiMoreVertical,
} from "react-icons/fi";
import { FaHeart, FaBookmark } from "react-icons/fa";
import styles from "./FeedVideoCard.module.css";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Gelen URL'yi (short, youtu.be veya embed) alıp, oynatılabilir bir embed URL'ye dönüştürür.
 */
const getYouTubeEmbedUrl = (url) => {
  let videoId = null;

  if (url.includes("youtube.com/embed/")) {
    const embedMatch = url.match(/embed\/([^?]+)/);
    if (embedMatch && embedMatch[1]) {
      videoId = embedMatch[1].split("?")[0];
    }
  } else {
    const videoIdMatch = url.match(/(?:\/shorts\/|youtu\.be\/|v=)([^&?/]+)/);
    if (videoIdMatch && videoIdMatch[1]) {
      videoId = videoIdMatch[1];
    }
  }

  if (!videoId) return null;

  const params = new URLSearchParams({
    autoplay: 1,
    muted: 0,
    loop: 1,
    controls: 1,
    playlist: videoId,
    modestbranding: 1,
  });

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
};

export default function PostVideoCard({
  videoSrc,
  description,
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
  const handleFollowClick = () => setFollowed((prev) => !prev);

  const embedUrl = getYouTubeEmbedUrl(videoSrc);
  if (!embedUrl) {
    console.error("Geçersiz video URL'si:", videoSrc);
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.videoCard}>
        {/* Video Alanı */}
        <div className={styles.videoWrapper} onDoubleClick={handleDoubleClick}>
          <iframe
            className={styles.videoFrame}
            src={embedUrl}
            title="YouTube video player"
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
                className={styles.heartAnimation}
              >
                <FaHeart />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Kullanıcı Bilgisi */}
        <div className={styles.infoCard}>
          <div className={styles.userInfo}>
            <img
              src={userProfileImage || "https://i.pravatar.cc/48"}
              alt={username || "Anonim Kullanıcı"}
              className={styles.userAvatar}
            />
            <div className={styles.userInfoText}>
              <span className={styles.userName}>
                {username || "Anonim Kullanıcı"}
              </span>
              <div className={styles.description}>{description}</div>
            </div>
            <button onClick={handleFollowClick} className={styles.followButton}>
              {followed ? "Takibi Bırak" : "Takip Et"}
            </button>
          </div>
        </div>
      </div>

      {/* Aksiyon Butonları */}
      <div className={styles.actionButtons}>
        <div className={styles.iconWrapper} onClick={handleLikeClick}>
          {liked ? (
            <FaHeart className={`${styles.iconItem} ${styles.likedIcon}`} />
          ) : (
            <FiHeart className={styles.iconItem} />
          )}
        </div>
        <div className={styles.iconWrapper}>
          <FiMessageCircle className={styles.iconItem} />
        </div>
        <div className={styles.iconWrapper} onClick={handleSaveClick}>
          {saved ? (
            <FaBookmark className={`${styles.iconItem} ${styles.savedIcon}`} />
          ) : (
            <FiBookmark className={styles.iconItem} />
          )}
        </div>
        <div className={styles.iconWrapper}>
          <FiSend className={styles.iconItem} />
        </div>
        <div className={styles.iconWrapper}>
          <FiMoreVertical className={styles.iconItem} />
        </div>
      </div>
    </div>
  );
}
