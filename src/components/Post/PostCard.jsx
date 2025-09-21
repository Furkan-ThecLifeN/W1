// src/components/AccountPage/Box/PostBox/PostBox.jsx
import React, { useState, useEffect } from "react";
import styles from "./PostCard.module.css";
import { FiMoreHorizontal } from "react-icons/fi";
import ActionControls from "../actions/ActionControls";
import { defaultGetAuthToken } from "../actions/api";
import FollowButton from "../FollowButton/FollowButton"; 
import { useNavigate } from "react-router-dom";

const PostCard = ({ data, isCurrentUser = false, followStatus = "none", onFollowStatusChange }) => {
  const [tokenError, setTokenError] = useState(false);
  const navigate = useNavigate();

  const getToken = async () => {
    try {
      return await defaultGetAuthToken();
    } catch (e) {
      console.error("PostCard: Token alma hatası ->", e.message);
      setTokenError(true);
      return null;
    }
  };

  const renderActionControls = () => {
    if (!data?.id) return null;
    return <ActionControls targetType="post" targetId={data.id} getAuthToken={getToken} />;
  };

  useEffect(() => {
    if (!data) return console.warn("PostCard: data yok!");
    if (!data.id) console.warn("PostCard: post id eksik!");
    if (!data.caption) console.warn("PostCard: caption eksik!");
    if (!data.imageUrls?.[0]) console.warn("PostCard: image yok!");
    console.log("PostCard Firestore id =>", data?.id);
  }, [data]);

  if (!data) return null;

  return (
    <>
      {/* Desktop View */}
      <div className={`${styles.post_card} ${styles.desktop}`}>
        {data.imageUrls?.[0] && (
          <img src={data.imageUrls[0]} alt="Post" className={styles.post_image} />
        )}

        <div className={styles.post_overlay}>
          <div className={styles.post_header}>
            <div className={styles.user_info}>
              <div className={styles.avatar_widget}>
                <img
                  src={data.photoURL || ""}
                  alt="avatar"
                  className={styles.avatar}
                  onClick={() => navigate(`/profile/${data.username}`)}
                />
              </div>
              <span className={styles.username}>
                {data.displayName || "Bilinmeyen Kullanıcı"}
              </span>
            </div>
            <div className={styles.actions}>
              {!isCurrentUser && (
                <FollowButton
                  targetUid={data.uid}
                  isTargetPrivate={data.isPrivate}
                  initialFollowStatus={followStatus}
                  onFollowStatusChange={(newStatus) =>
                    onFollowStatusChange?.(newStatus, data.uid)
                  }
                />
              )}
              <FiMoreHorizontal className={styles.more_icon} />
            </div>
          </div>

          <div className={styles.post_footer}>
            <p className={styles.post_text}>{data.caption || ""}</p>
            {renderActionControls()}

            {tokenError && (
              <div style={{ color: "red", fontSize: "12px" }}>
                Token alınamadı, ActionControls çalışmayabilir!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className={`${styles.post_card_mobile} ${styles.mobile}`}>
        <div className={styles.post_header_mobile}>
          <div className={styles.user_info}>
            <div className={styles.avatar_widget}>
              <img
                src={data.photoURL || ""}
                alt="avatar"
                className={styles.avatar}
                onClick={() => navigate(`/profile/${data.username}`)}
              />
            </div>
            <span className={styles.username}>
              {data.displayName || "Bilinmeyen Kullanıcı"}
            </span>
          </div>
          <div className={styles.actions}>
            {!isCurrentUser && (
              <FollowButton
                targetUid={data.uid}
                isTargetPrivate={data.isPrivate}
                initialFollowStatus={followStatus}
                onFollowStatusChange={(newStatus) =>
                  onFollowStatusChange?.(newStatus, data.uid)
                }
              />
            )}
            <FiMoreHorizontal className={styles.more_icon} />
          </div>
        </div>

        {data.imageUrls?.[0] && (
          <img src={data.imageUrls[0]} alt="Post" className={styles.post_image_mobile} />
        )}

        <div className={styles.post_footer_mobile}>
          <p className={styles.post_text}>{data.caption || ""}</p>
          {renderActionControls()}
        </div>
      </div>
    </>
  );
};

export default PostCard;
