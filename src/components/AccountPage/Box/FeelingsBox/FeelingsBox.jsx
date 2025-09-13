// /components/Box/FeelingsBox/FeelingsBox.jsx
import React, { useState, useEffect } from "react";
import styles from "./FeelingsBox.module.css";
import {
  FiMoreHorizontal,
  FiMessageCircle,
  FiSend,
  FiBookmark,
} from "react-icons/fi";
import { FaHeart, FaBookmark } from "react-icons/fa";
import { auth } from "../../../../config/firebase-client";
import { useUser } from "../../../../context/UserContext";
import { useAuth } from "../../../../context/AuthProvider";

const FeelingsBox = ({ feeling }) => {
  const { currentUser } = useUser();
  const { showToast } = useAuth(); // Toast bildirimi için useAuth hook'u
  const [liked, setLiked] = useState(false); // Başlangıçta false olarak ayarla
  const [saved, setSaved] = useState(feeling?.isSavedByMe || false);
  const [showModal, setShowModal] = useState(false);
  const [likeCount, setLikeCount] = useState(feeling?.stats?.likes || 0);
  const [isUpdating, setIsUpdating] = useState(false);

  const { caption, text, displayName, photoURL, imageUrls, images, privacy } =
    feeling || {};

  const tweetText = caption || text || "";
  const postDisplayName = displayName || "Kullanıcı";
  const userProfileImage =
    photoURL ||
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";
  const tweetImages = imageUrls || images || [];
  const validPostId = feeling?.id || feeling?.postId || feeling?.uid;
  const postType = privacy === "public" ? "globalFeelings" : "feelings";

  useEffect(() => {
    // Sayfa yüklendiğinde beğeni durumunu kontrol et
    const checkLikedStatus = async () => {
      if (!currentUser || !validPostId) return;

      try {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/actions/check-like`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ postId: validPostId, postType: postType }),
          }
        );

        if (!res.ok) {
          throw new Error("Beğeni durumu alınamadı.");
        }

        const data = await res.json();
        setLiked(data.liked);
      } catch (err) {
        console.error("Beğeni durumu kontrol hatası:", err);
      }
    };

    checkLikedStatus();
  }, [currentUser, validPostId, postType]);

  const handleLike = async () => {
    if (!currentUser) {
      showToast("Beğenmek için giriş yapmalısınız.", "error");
      return;
    }
    if (!validPostId || isUpdating) return;

    // İyimser Güncelleme: UI'ı hemen güncelle
    const previousLiked = liked;
    const previousLikeCount = likeCount;

    setLiked(!previousLiked);
    setLikeCount(previousLiked ? previousLikeCount - 1 : previousLikeCount + 1);
    setIsUpdating(true);

    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/actions/toggle-like`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ postId: validPostId, postType: postType }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Beğeni işlemi başarısız.");
      }

      // Backend'den dönen güncel beğeni sayısını al
      const data = await res.json();
      setLikeCount(data.newLikesCount);

    } catch (err) {
      console.error("Beğenme hatası:", err);
      // Hata durumunda eski duruma geri dön
      setLiked(previousLiked);
      setLikeCount(previousLikeCount);
      showToast(
        "Beğeni işlemi sırasında bir sorun oluştu. Lütfen tekrar deneyin.",
        "error"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSave = () => setSaved(!saved);

  // CardContent kısmı aynı kalır...
  const CardContent = () => (
    <>
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
        <div className={styles.actions}>
          <FiMoreHorizontal className={styles.more} />
        </div>
      </div>

      <div className={styles.content}>
        <p>{tweetText}</p>
        {tweetImages.length > 0 && (
          <div className={styles.imageWrapper}>
            <img
              src={tweetImages[0]}
              alt="Tweet Görseli"
              className={styles.tweetImage}
            />
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <FaHeart
          className={`${styles.icon} ${liked ? styles.liked : ""} ${
            isUpdating ? styles.disabled : ""
          }`}
          onClick={handleLike}
        />
        <span>{likeCount}</span>
        <FiMessageCircle className={styles.icon} />
        <FiSend className={styles.icon} />
        {saved ? (
          <FaBookmark className={styles.icon} onClick={handleSave} />
        ) : (
          <FiBookmark className={styles.icon} onClick={handleSave} />
        )}
      </div>
    </>
  );

  return (
    <>
      <div className={`${styles.card} ${styles.desktop}`}>
        <CardContent />
      </div>

      <div
        className={`${styles.card_mobile} ${styles.mobile}`}
        onClick={() => setShowModal(true)}
      >
        <div className={styles.header_mobile}>
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
          <div className={styles.more_mobile}>
            <FiMoreHorizontal className={styles.more} />
          </div>
        </div>

        <div className={styles.content_mobile}>
          <p>{tweetText}</p>
        </div>
      </div>

      {showModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowModal(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <CardContent />
          </div>
        </div>
      )}
    </>
  );
};

export default FeelingsBox;