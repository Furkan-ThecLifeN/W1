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
import ActionsModal from "../ActionsModal/ActionsModal";

const FeelingsBox = ({ feeling }) => {
  const { currentUser } = useUser();
  const { showToast } = useAuth();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [likeCount, setLikeCount] = useState(feeling?.stats?.likes || 0);
  const [commentCount, setCommentCount] = useState(
    feeling?.stats?.comments || 0
  );
  const [shareCount, setShareCount] = useState(feeling?.stats?.shares || 0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState("comments");

  const { caption, text, displayName, photoURL, imageUrls, images } =
    feeling || {};

  const tweetText = caption || text || "";
  const postDisplayName = displayName || "Kullanıcı";
  const userProfileImage =
    photoURL ||
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";
  const tweetImages = imageUrls || images || [];
  const postId = feeling?.id;
  const postType = feeling?.privacy === "public" ? "globalFeelings" : "feelings";

  // kullanıcı aksiyonlarını kontrol et
  useEffect(() => {
    const checkUserActions = async () => {
      if (!currentUser || !postId) return;
      try {
        const token = await auth.currentUser?.getIdToken();

        const [likeRes, saveRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_URL}/api/actions/check-like`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ postId, postType }),
          }),
          fetch(`${process.env.REACT_APP_API_URL}/api/actions/check-save`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ postId, postType }),
          }),
        ]);

        const [likeData, saveData] = await Promise.all([
          likeRes.json(),
          saveRes.json(),
        ]);

        setLiked(likeData.isLiked);
        setSaved(saveData.isSaved);
      } catch (error) {
        console.error("Kullanıcı eylemlerini kontrol etme hatası:", error);
      }
    };

    checkUserActions();
  }, [currentUser, postId, postType]);

  // beğen
  const handleLike = async () => {
    if (!currentUser || isUpdating) return;
    setIsUpdating(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/actions/toggle-like`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ postId: feeling.id, postType }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        setLiked(!liked);
        setLikeCount(data.newLikesCount);
      } else {
        const errorData = await res.json();
        showToast("error", errorData.error || "Beğeni işlemi başarısız oldu.");
      }
    } catch (error) {
      showToast(
        "error",
        "Bir hata oluştu. Lütfen daha sonra tekrar deneyin."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // kaydet
  const handleSave = async () => {
    if (!currentUser || isUpdating) return;
    setIsUpdating(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/actions/toggle-save`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ postId: feeling.id, postType }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        setSaved(data.isSaved);
        showToast("success", data.isSaved ? "Kaydedildi!" : "Kaydetme iptal edildi.");
      } else {
        const errorData = await res.json();
        showToast("error", errorData.error || "Kaydetme işlemi başarısız.");
      }
    } catch (error) {
      showToast("error", "Bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCommentUpdate = (newCommentCount) => {
    setCommentCount(newCommentCount);
  };

  const handleShareUpdate = (newShareCount) => {
    setShareCount(newShareCount);
  };

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

      {/* eski yapı: ikon + sayı inline */}
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
    </>
  );

  return (
    <>
      <div className={`${styles.card} ${styles.desktop}`}>
        <CardContent />
      </div>

      <div
        className={`${styles.card_mobile} ${styles.mobile}`}
        onClick={() => {
          setActiveModalTab("comments");
          setShowModal(true);
        }}
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
        <ActionsModal
          show={showModal}
          onClose={() => setShowModal(false)}
          post={feeling}
          initialTab={activeModalTab}
          onCommentAdded={handleCommentUpdate}
          onShared={handleShareUpdate}
        />
      )}
    </>
  );
};

export default FeelingsBox;
