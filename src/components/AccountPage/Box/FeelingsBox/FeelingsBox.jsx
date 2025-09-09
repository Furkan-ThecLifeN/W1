import React, { useState } from "react";
import styles from "./FeelingsBox.module.css";
import { FiMoreHorizontal, FiMessageCircle, FiSend, FiBookmark } from "react-icons/fi";
import { FaHeart, FaBookmark } from "react-icons/fa";

const FeelingsBox = ({ feeling }) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  // Backend’den gelen veriler
  const tweetText = feeling?.caption || feeling?.text || "";
  const username = feeling?.username || "Bilinmiyor";
  const displayName = feeling?.displayName || "Kullanıcı";
  const userProfileImage =
    feeling?.photoURL ||
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";
  const tweetImages = feeling?.imageUrls || feeling?.images || [];

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.user}>
          <div className={styles.avatar_widget}>
            <img src={userProfileImage} alt={displayName} className={styles.avatar} />
          </div>
          <span className={styles.username}>{displayName}</span>
        </div>
        <div className={styles.actions}>
          <FiMoreHorizontal className={styles.more} />
        </div>
      </div>

      {/* İçerik */}
      <div className={styles.content}>
        <p>{tweetText}</p>
        {tweetImages.length > 0 && (
          <div className={styles.imageWrapper}>
            <img src={tweetImages[0]} alt="Tweet Görseli" className={styles.tweetImage} />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <FaHeart
          className={`${styles.icon} ${liked ? styles.liked : ""}`}
          onClick={() => setLiked(!liked)}
        />
        <FiMessageCircle className={styles.icon} />
        <FiSend className={styles.icon} />
        {saved ? (
          <FaBookmark className={styles.icon} onClick={() => setSaved(false)} />
        ) : (
          <FiBookmark className={styles.icon} onClick={() => setSaved(true)} />
        )}
      </div>
    </div>
  );
};

export default FeelingsBox;
