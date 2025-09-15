// /components/Box/FeelingsBox/FeelingsBox.jsx

import React, { useState, useEffect, useCallback, useRef } from "react";
import styles from "./FeelingsBox.module.css";
import {
  FiMoreHorizontal,
  FiMessageCircle,
  FiSend,
  FiBookmark,
} from "react-icons/fi";
import { FaHeart, FaBookmark } from "react-icons/fa";
import { useUser } from "../../../../context/UserContext";
import { useAuth } from "../../../../context/AuthProvider";
import ActionsModal from "../ActionsModal/ActionsModal";
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

const FeelingsBox = ({ feeling, initialLiked, initialSaved }) => {
  const { currentUser } = useUser();
  const { showToast } = useAuth();
  const [liked, setLiked] = useState(initialLiked);
  const [saved, setSaved] = useState(initialSaved);
  const [showModal, setShowModal] = useState(false);
  const [likeCount, setLikeCount] = useState(feeling?.stats?.likes || 0);
  const [commentCount, setCommentCount] = useState(
    feeling?.stats?.comments || 0
  );
  const [shareCount, setShareCount] = useState(feeling?.stats?.shares || 0);
  const isUpdating = useRef(false);
  const [activeModalTab, setActiveModalTab] = useState("comments");

  const { caption, text, displayName, photoURL, imageUrls, images } =
    feeling || {};

  const postId = feeling?.id;
  const postType = feeling?.privacy === "public" ? "globalFeelings" : "feelings";

  // Axios instance with common headers
  const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
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
        await api.post("/api/actions/toggle-like", { postId, postType }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error("Beğeni durumu güncellenirken hata:", error);
        setLiked(!isLikedNow);
        setLikeCount(prevCount);
        if (error.response?.status === 429) {
          showToast("Çok fazla istek gönderdiniz. Lütfen yavaşlayın.", "error");
        } else {
          showToast("Beğeni işlemi başarısız oldu. Lütfen tekrar deneyin.", "error");
        }
      } finally {
        isUpdating.current = false;
      }
    }, 500),
    [postId, postType, showToast]
  );

  const debouncedToggleSave = useCallback(
    debounce(async (isSavedNow) => {
      if (isUpdating.current) return;
      isUpdating.current = true;
      try {
        const token = await auth.currentUser?.getIdToken();
        await api.post("/api/actions/toggle-save", { postId, postType }, {
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
    [postId, postType, showToast]
  );

  const handleLike = () => {
    if (!currentUser) return;
    const previousLiked = liked;
    const previousCount = likeCount;
    setLiked(!previousLiked);
    setLikeCount(previousLiked ? previousCount - 1 : previousCount + 1);
    debouncedToggleLike(!previousLiked, previousCount);
  };

  const handleSave = () => {
    if (!currentUser) return;
    const previousSaved = saved;
    setSaved(!previousSaved);
    debouncedToggleSave(!previousSaved);
  };

  const handleCommentUpdate = (newCommentCount) => {
    setCommentCount(newCommentCount);
  };

  const handleShareUpdate = (newShareCount) => {
    setShareCount(newShareCount);
  };

  const tweetText = caption || text || "";
  const postDisplayName = displayName || "Kullanıcı";
  const userProfileImage =
    photoURL ||
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";
  const tweetImages = imageUrls || images || [];
  
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.user}>
          <div className={styles.avatar_widget}>
            <img
              src={userProfileImage}
              alt={postDisplayName}
              className={styles.avatar}
            />
          </div>
          <span className={styles.username}>{postDisplayName}</span>
        </div>
        <div className={styles.more}>
          <FiMoreHorizontal
            className={styles.more_icon}
            onClick={() => {
              setActiveModalTab("options");
              setShowModal(true);
            }}
          />
        </div>
      </div>

      <div className={styles.content}>
        <p>{tweetText}</p>
        {tweetImages.length > 0 && (
          <div className={styles.image_container}>
            {tweetImages.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Post görseli ${index + 1}`}
                className={styles.post_image}
              />
            ))}
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <div onClick={handleLike} className={styles.action_item}>
          <FaHeart className={`${styles.icon} ${liked ? styles.liked : ""}`} />
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

      {showModal && (
        <ActionsModal
          show={showModal}
          onClose={() => setShowModal(false)}
          post={feeling}
          initialTab={activeModalTab}
          onCommentAdded={handleCommentUpdate}
          onShared={handleShareUpdate}
        />
      )}
    </div>
  );
};

export default FeelingsBox;