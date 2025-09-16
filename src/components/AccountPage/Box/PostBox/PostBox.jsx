// /components/Box/PostBox/PostBox.jsx

import React, { useState, useCallback, useRef, useEffect } from "react";
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
import PostsActionsModal from "./PostsActionsModal/PostsActionsModal";

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
  const [likeCount, setLikeCount] = useState(Number(post?.stats?.likes) || 0);
  const [commentCount, setCommentCount] = useState(Number(post?.stats?.comments) || 0);
  const [shareCount, setShareCount] = useState(Number(post?.stats?.shares) || 0);
  const [saved, setSaved] = useState(initialSaved);
  const [showModal, setShowModal] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState("comments");
  const isUpdating = useRef(false);

  const postId = post?._id || post?.id;
  const { caption, username, displayName, photoURL, imageUrls } = post || {};
  const imageUrl = imageUrls?.length > 0 ? imageUrls[0] : null;

  // useEffect
  useEffect(() => {
    setLikeCount(Number(post?.stats?.likes) || 0);
    setCommentCount(Number(post?.stats?.comments) || 0);
    setShareCount(Number(post?.stats?.shares) || 0);
  }, [post?.stats?.likes, post?.stats?.comments, post?.stats?.shares]);

  const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  const debouncedToggleLike = useCallback(
    debounce(async (isLikedNow, prevCount) => {
      if (isUpdating.current) return;
      isUpdating.current = true;

      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) {
          showToast("Bu işlemi yapmak için lütfen giriş yapın.", "error");
          setLiked(!isLikedNow);
          setLikeCount(prevCount);
          isUpdating.current = false;
          return;
        }

        const response = await api.post(
          "/api/posts/like-toggle",
          { postId, postType: "posts" },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          setLiked(response.data.isLiked);
          setLikeCount(Number(response.data.likeCount) || 0);
        }
      } catch (error) {
        console.error("Beğeni durumu güncellenirken hata:", error);
        setLiked(!isLikedNow);
        setLikeCount(prevCount);

        if (error.response?.status === 401) {
          showToast(
            "Bu işlemi yapmak için oturumunuzun açık olması gerekiyor. Lütfen giriş yapın.",
            "error"
          );
        } else if (error.response?.status === 429) {
          showToast("Çok fazla istek gönderdiniz. Lütfen yavaşlayın.", "error");
        } else {
          showToast(
            "Beğeni işlemi başarısız oldu. Lütfen tekrar deneyin.",
            "error"
          );
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
        await api.post(
          "/api/posts/save-toggle",
          { postId, postType: "posts" },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } catch (error) {
        console.error("Kaydetme durumu güncellenirken hata:", error);
        setSaved(!isSavedNow);
        if (error.response?.status === 429) {
          showToast("Çok fazla istek gönderdiniz. Lütfen yavaşlayın.", "error");
        } else {
          showToast(
            "Kaydetme işlemi başarısız oldu. Lütfen tekrar deneyin.",
            "error"
          );
        }
      } finally {
        isUpdating.current = false;
      }
    }, 500),
    [postId, showToast]
  );

  const handleLike = () => {
    const previousLiked = liked;
    const previousCount = Number(likeCount) || 0;
    setLiked(!previousLiked);
    setLikeCount(previousLiked ? previousCount - 1 : previousCount + 1);
    debouncedToggleLike(!previousLiked, previousCount);
  };

  const handleSave = () => {
    const previousSaved = saved;
    setSaved(!previousSaved);
    debouncedToggleSave(!previousSaved);
  };

  const handleCommentUpdate = () => {
    setCommentCount((prev) => Number(prev) + 1);
  };

  const handleShareUpdate = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      await api.post(
        "/api/posts/share-post",
        { postId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setShareCount((prev) => Number(prev) + 1);
    } catch (error) {
      console.error("Paylaşım sayısı güncellenirken hata:", error);
      showToast("Paylaşım işlemi başarısız oldu.", "error");
    }
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
              <div onClick={handleLike} className={styles.action_item}>
                <FaHeart
                  className={`${styles.icon} ${liked ? styles.liked : ""}`}
                />
                <span>{likeCount}</span>
              </div>
              <div
                onClick={() => {
                  setActiveModalTab("comments");
                  setShowModal(true);
                }}
                className={styles.action_item}
              >
                <FiMessageCircle className={styles.icon} />
                <span>{commentCount}</span>
              </div>
              <div
                onClick={() => {
                  setActiveModalTab("share");
                  setShowModal(true);
                  handleShareUpdate();
                }}
                className={styles.action_item}
              >
                <FiSend className={styles.icon} />
                <span>{shareCount}</span>
              </div>
              <div onClick={handleSave} className={styles.action_item}>
                {saved ? (
                  <FaBookmark className={styles.icon} />
                ) : (
                  <FiBookmark className={styles.icon} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Mini Card Buton */}
      <div
        className={`${styles.post_card_mini} ${styles.mobile}`}
        onClick={() => {
          setActiveModalTab("comments");
          setShowModal(true);
        }}
      >
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Mini Post"
            className={styles.post_image_mini}
          />
        )}
      </div>

      {showModal && (
        <PostsActionsModal
          show={showModal}
          onClose={() => setShowModal(false)}
          post={post}
          initialTab={activeModalTab}
          onCommentAdded={handleCommentUpdate}
          onShared={handleShareUpdate}
        />
      )}
    </>
  );
};

export default PostBox;
