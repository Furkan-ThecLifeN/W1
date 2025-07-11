import React, { useState } from "react";
import styles from "./TweetCard.module.css";
import {
  FiMoreHorizontal,
  FiMessageCircle,
  FiSend,
  FiBookmark,
} from "react-icons/fi";
import { FaHeart, FaBookmark } from "react-icons/fa";

const TweetCard = () => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.user}>
          <div className={styles.avatar_widget}>
            <div className={styles.avatar}></div>
          </div>
          <span className={styles.username}>Jane Doe</span>
        </div>
        <div className={styles.actions}>
          <button className={styles.follow}>Follow</button>
          <FiMoreHorizontal className={styles.more} />
        </div>
      </div>

      <div className={styles.content}>
        “Just finished a great workout! 💪 Time to recharge and keep pushing forward. #motivation”
      </div>

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

export default TweetCard;
