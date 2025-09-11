import React, { useState } from "react";
import styles from "./TweetCard.module.css";
import {
  FiMoreHorizontal,
  FiMessageCircle,
  FiSend,
  FiBookmark,
} from "react-icons/fi";
import { FaHeart, FaBookmark } from "react-icons/fa";

const TweetCard = ({ data }) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.user}>
          <div className={styles.avatar_widget}>
            <img
              src={data?.photoURL}
              alt="avatar"
              className={styles.avatar}
            />
          </div>
          <span className={styles.username}>{data?.displayName}</span>
        </div>
        <div className={styles.actions}>
          <button className={styles.follow}>Follow</button>
          <FiMoreHorizontal className={styles.more} />
        </div>
      </div>

      <div className={styles.content}>{data?.text}</div>

      <div className={styles.footer}>
        <FaHeart
          className={`${styles.icon} ${styles.heart} ${liked ? styles.liked : ""}`}
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
