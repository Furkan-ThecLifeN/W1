// /components/Box/PostBox/PostBox.jsx

import React, { useState, useCallback, useRef } from "react";
import styles from "./PostBox.module.css";
import {
  FiMoreHorizontal,
  FiMessageCircle,
  FiSend,
  FiBookmark,
} from "react-icons/fi";
import { FaHeart, FaBookmark } from "react-icons/fa";
import { useAuth } from "../../../../context/AuthProvider";
import axios from "axios";
import { auth } from "../../../../config/firebase-client";

// Helper fonksiyon: Debounce
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

const PostBox = ({ post, initialLiked, initialSaved }) => {
  const { showToast } = useAuth();
  const [liked, setLiked] = useState(initialLiked);
  const [saved, setSaved] = useState(initialSaved);
  const [showModal, setShowModal] = useState(false);
  const isUpdating = useRef(false);

  const { caption, username, displayName, photoURL, imageUrls, _id: postId } = post || {};
  const imageUrl = imageUrls?.length > 0 ? imageUrls[0] : null;

  // Axios instance with common headers
  const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  const debouncedToggleLike = useCallback(
    debounce(async (isLikedNow) => {
      if (isUpdating.current) return;
      isUpdating.current = true;
      try {
        const token = await auth.currentUser?.getIdToken();
        await api.post("/api/actions/toggle-like", { postId }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error("Beğeni durumu güncellenirken hata:", error);
        setLiked(!isLikedNow);
        if (error.response?.status === 429) {
          showToast("Çok fazla istek gönderdiniz. Lütfen yavaşlayın.", "error");
        } else {
          showToast("Beğeni işlemi başarısız oldu. Lütfen tekrar deneyin.", "error");
        }
      } finally {
        isUpdating.current = false;
      }
    }, 500),
    [postId, showToast]
  );

  const debouncedToggleSave = useCallback(
    debounce(async (isSavedNow) => {
      if (isUpdating.current) return;
      isUpdating.current = true;
      try {
        const token = await auth.currentUser?.getIdToken();
        await api.post("/api/actions/toggle-save", { postId }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error("Kaydetme durumu güncellenirken hata:", error);
        setSaved(!isSavedNow);
        if (error.response?.status === 429) {
          showToast("Çok fazla istek gönderdiniz. Lütfen yavaşlayın.", "error");
        } else {
          showToast("Kaydetme işlemi başarısız oldu. Lütfen tekrar deneyin.", "error");
        }
      } finally {
        isUpdating.current = false;
      }
    }, 500),
    [postId, showToast]
  );
  
  const handleLike = () => {
    const previousLiked = liked;
    setLiked(prev => !prev);
    debouncedToggleLike(previousLiked);
  };

  const handleSave = () => {
    const previousSaved = saved;
    setSaved(prev => !prev);
    debouncedToggleSave(previousSaved);
  };

  const postText = post?.caption || "";
  const userProfileImage =
    post?.photoURL ||
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";
  
  return (
    <>
      {/* Masaüstü hali */}
      <div className={`${styles.post_card} ${styles.desktop}`}>
        {imageUrl && (
          <img src={imageUrl} alt="Post" className={styles.post_image} />
        )}
        <div className={styles.post_overlay}>
          <div className={styles.post_header}>
            <div className={styles.user_info}>
              <div className={styles.avatar_widget}>
                <img
                  src={userProfileImage}
                  alt={displayName}
                  className={styles.avatar}
                />
              </div>
              <span className={styles.username}>{displayName}</span>
            </div>
            <div className={styles.actions}>
              <FiMoreHorizontal className={styles.more_icon} />
            </div>
          </div>

          <div className={styles.post_footer}>
            <p className={styles.post_text}>{postText}</p>
            <div className={styles.footer_actions}>
              <FaHeart
                className={`${styles.icon} ${liked ? styles.liked : ""}`}
                onClick={handleLike}
              />
              <FiMessageCircle className={styles.icon} />
              <FiSend className={styles.icon} />
              <div className={styles.save_icon_wrapper} onClick={handleSave}>
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

      {/* ✅ Mobile Mini Card Buton */}
      <div
        className={`${styles.post_card_mini} ${styles.mobile}`}
        onClick={() => setShowModal(true)}
      >
        {imageUrl && (
          <img src={imageUrl} alt="Mini Post" className={styles.post_image_mini} />
        )}
      </div>

      {/* ✅ Modal açıldığında masaüstü hali gösterilir */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.post_card}>
              {imageUrl && (
                <img src={imageUrl} alt="Post" className={styles.post_image} />
              )}
              <div className={styles.post_overlay}>
                <div className={styles.post_header}>
                  <div className={styles.user_info}>
                    <div className={styles.avatar_widget}>
                      <img
                        src={userProfileImage}
                        alt={displayName}
                        className={styles.avatar}
                      />
                    </div>
                    <span className={styles.username}>{displayName}</span>
                  </div>
                  <div className={styles.actions}>
                    <FiMoreHorizontal className={styles.more_icon} />
                  </div>
                </div>

                <div className={styles.post_footer}>
                  <p className={styles.post_text}>{postText}</p>
                  <div className={styles.footer_actions}>
                    <FaHeart
                      className={`${styles.icon} ${liked ? styles.liked : ""}`}
                      onClick={handleLike}
                    />
                    <FiMessageCircle className={styles.icon} />
                    <FiSend className={styles.icon} />
                    <div
                      className={styles.save_icon_wrapper}
                      onClick={handleSave}
                    >
                      <FiBookmark
                        className={`${styles.icon} ${
                          saved ? styles.hidden : ""
                        }`}
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
          </div>
        </div>
      )}
    </>
  );
};

export default PostBox;