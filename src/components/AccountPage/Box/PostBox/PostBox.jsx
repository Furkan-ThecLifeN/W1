import React, { useState } from "react";
import styles from "./PostBox.module.css";
import {
  FiMoreHorizontal,
  FiMessageCircle,
  FiSend,
  FiBookmark,
} from "react-icons/fi";
import { FaHeart, FaBookmark } from "react-icons/fa";

const PostBox = ({ post }) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleLike = () => setLiked((prev) => !prev);
  const toggleSave = () => setSaved((prev) => !prev);

  // Backend’den gelen veriler
  const imageUrl = post?.imageUrls?.length > 0 ? post.imageUrls[0] : null;
  const postText = post?.caption || "";
  const username = post?.username || "Bilinmiyor";
  const displayName = post?.displayName || "Kullanıcı";
  const userProfileImage =
    post?.photoURL || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";

  return (
    <>
      {/* Desktop Tasarım */}
      <div className={`${styles.post_card} ${styles.desktop}`}>
        {imageUrl && <img src={imageUrl} alt="Post" className={styles.post_image} />}

        <div className={styles.post_overlay}>
          <div className={styles.post_header}>
            <div className={styles.user_info}>
              <div className={styles.avatar_widget}>
                <img src={userProfileImage} alt={displayName} className={styles.avatar} />
              </div>
              <span className={styles.username}>{displayName}</span>
            </div>
            <div className={styles.actions}>
              <button className={styles.follow_btn}>Follow</button>
              <FiMoreHorizontal className={styles.more_icon} />
            </div>
          </div>

          <div className={styles.post_footer}>
            <p className={styles.post_text}>{postText}</p>
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
                  className={`${styles.icon} ${saved ? styles.visible : styles.hidden}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Tasarım */}
      <div className={`${styles.post_card_mobile} ${styles.mobile}`}>
        <div className={styles.post_header_mobile}>
          <div className={styles.user_info}>
            <div className={styles.avatar_widget}>
              <img src={userProfileImage} alt={displayName} className={styles.avatar} />
            </div>
            <span className={styles.username}>{displayName}</span>
          </div>
          <div className={styles.actions}>
            <button className={styles.follow_btn}>Follow</button>
            <FiMoreHorizontal className={styles.more_icon} />
          </div>
        </div>

        {imageUrl && (
          <img src={imageUrl} alt="Post" className={styles.post_image_mobile} />
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
              className={`${styles.icon} ${saved ? styles.visible : styles.hidden}`}
            />
          </div>
        </div>

        <div className={styles.post_footer_mobile}>
          <p className={styles.post_text}>{postText}</p>
        </div>
      </div>
    </>
  );
};

export default PostBox;
