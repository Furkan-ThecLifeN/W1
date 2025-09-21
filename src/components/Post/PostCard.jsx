// src/components/Post/PostCard.jsx
import React, { useState, useEffect } from "react";
import styles from "./PostCard.module.css";
import { FiMoreHorizontal } from "react-icons/fi";
import ActionControls from "../actions/ActionControls";
import { defaultGetAuthToken } from "../actions/api";
import FollowButton from "../FollowButton/FollowButton";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import PostOptionsCard from "../PostOptionsCard/PostOptionsCard"; // Yeni import

// API'nin temel URL'ini ortam değişkeninden alıyoruz.
// Bu, hem geliştirme hem de üretim ortamında doğru çalışmayı sağlar.
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

const PostCard = ({ data, followStatus = "none", onFollowStatusChange }) => {
  const [tokenError, setTokenError] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const getToken = async () => {
    try {
      return await defaultGetAuthToken();
    } catch (e) {
      console.error("PostCard: Token alma hatası ->", e.message);
      setTokenError(true);
      return null;
    }
  };

  const isOwnPost = currentUser?.uid === data?.uid;

  const renderActionControls = () => {
    if (!data?.id) return null;
    return (
      <ActionControls
        targetType="post"
        targetId={data.id}
        getAuthToken={getToken}
        commentsDisabled={data.commentsDisabled}
      />
    );
  };

  // Gönderiyi silme fonksiyonu
  const handleDeletePost = async () => {
    if (window.confirm("Gönderiyi silmek istediğinize emin misiniz?")) {
      try {
        const token = await getToken();
        // URL güncellendi: Doğru API adresini kullanıyor
        await fetch(`${BASE_URL}/api/posts/${data.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Gönderi silindi.");
        setShowOptions(false);
      } catch (error) {
        console.error("Gönderi silme hatası:", error);
        alert("Gönderi silinirken bir hata oluştu.");
      }
    }
  };

  // Yorumları kapatma fonksiyonu
  const handleDisableComments = async () => {
    try {
      const token = await getToken();
      // URL güncellendi: Doğru API adresini kullanıyor
      await fetch(`${BASE_URL}/api/posts/${data.id}/disable-comments`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Yorumlar kapatıldı.");
      setShowOptions(false);
    } catch (error) {
      console.error("Yorumları kapatma hatası:", error);
      alert("Yorumlar kapatılırken bir hata oluştu.");
    }
  };

  useEffect(() => {
    if (!data) return console.warn("PostCard: data yok!");
    if (!data.id) console.warn("PostCard: post id eksik!");
    if (!data.caption) console.warn("PostCard: caption eksik!");
    if (!data.imageUrls?.[0]) console.warn("PostCard: image yok!");
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
              {!isOwnPost && (
                <FollowButton
                  targetUid={data.uid}
                  isTargetPrivate={data.isPrivate}
                  initialFollowStatus={followStatus}
                  onFollowStatusChange={(newStatus) =>
                    onFollowStatusChange?.(newStatus, data.uid)
                  }
                />
              )}
              <div className={styles.optionsContainer}>
                <FiMoreHorizontal
                  className={styles.more_icon}
                  onClick={() => setShowOptions(!showOptions)}
                />
                {showOptions && (
                  <PostOptionsCard
                    isOwner={isOwnPost}
                    postId={data.id}
                    postOwnerId={data.uid}
                    onDelete={handleDeletePost}
                    onDisableComments={handleDisableComments}
                  />
                )}
              </div>
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
            {!isOwnPost && (
              <FollowButton
                targetUid={data.uid}
                isTargetPrivate={data.isPrivate}
                initialFollowStatus={followStatus}
                onFollowStatusChange={(newStatus) =>
                  onFollowStatusChange?.(newStatus, data.uid)
                }
              />
            )}
            <div className={styles.optionsContainer}>
              <FiMoreHorizontal
                className={styles.more_icon}
                onClick={() => setShowOptions(!showOptions)}
              />
              {showOptions && (
                <PostOptionsCard
                  isOwner={isOwnPost}
                  postId={data.id}
                  postOwnerId={data.uid}
                  onDelete={handleDeletePost}
                  onDisableComments={handleDisableComments}
                />
              )}
            </div>
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