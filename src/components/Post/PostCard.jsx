import React, { useState } from "react";
import styles from "./PostCard.module.css";
import {
  FiMoreHorizontal,
  FiMessageCircle,
  FiSend,
  FiBookmark,
} from "react-icons/fi";
import { FaHeart, FaBookmark } from "react-icons/fa";

const PostCard = ({ data }) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleLike = () => setLiked((prev) => !prev);
  const toggleSave = () => setSaved((prev) => !prev);

  return (
    <>
      {/* Desktop tasarımı */}
      <div className={`${styles.post_card} ${styles.desktop}`}>
        {data?.imageUrls?.[0] && (
          <img src={data.imageUrls[0]} alt="Post" className={styles.post_image} />
        )}

        <div className={styles.post_overlay}>
          <div className={styles.post_header}>
            <div className={styles.user_info}>
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
              <button className={styles.follow_btn}>Follow</button>
              <FiMoreHorizontal className={styles.more_icon} />
            </div>
          </div>

          <div className={styles.post_footer}>
            <p className={styles.post_text}>{data?.caption}</p>
            <div className={styles.footer_actions}>
              <FaHeart
                className={`${styles.icon} ${liked ? styles.liked : ""}`}
                onClick={toggleLike}
              />
              <FiMessageCircle className={styles.icon} />
              <FiSend className={styles.icon} />
              <div className={styles.save_icon_wrapper} onClick={toggleSave}>
                <FiBookmark
                  className={`${styles.icon} ${saved ? styles.hidden : ""}`}
                />
                <FaBookmark
                  className={`${styles.icon} ${
                    saved ? styles.visible : styles.hidden
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobil & Tablet tasarımı */}
      <div className={`${styles.post_card_mobile} ${styles.mobile}`}>
        <div className={styles.post_header_mobile}>
          <div className={styles.user_info}>
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
            <button className={styles.follow_btn}>Follow</button>
            <FiMoreHorizontal className={styles.more_icon} />
          </div>
        </div>

        {data?.imageUrls?.[0] && (
          <img
            src={data.imageUrls[0]}
            alt="Post"
            className={styles.post_image_mobile}
          />
        )}

        <div className={styles.footer_actions_mobile}>
          <FaHeart
            className={`${styles.icon} ${liked ? styles.liked : ""}`}
            onClick={toggleLike}
          />
          <FiMessageCircle className={styles.icon} />
          <FiSend className={styles.icon} />
          <div className={styles.save_icon_wrapper} onClick={toggleSave}>
            <FiBookmark
              className={`${styles.icon} ${saved ? styles.hidden : ""}`}
            />
            <FaBookmark
              className={`${styles.icon} ${
                saved ? styles.visible : styles.hidden
              }`}
            />
          </div>
        </div>

        <div className={styles.post_footer_mobile}>
          <p className={styles.post_text}>{data?.caption}</p>
        </div>
      </div>
    </>
  );
};

export default PostCard;
