// VideoFeedItem.jsx

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  FiHeart,
  FiMessageCircle,
  FiBookmark,
  FiSend,
  FiMoreVertical,
} from "react-icons/fi";
import { FaHeart, FaBookmark } from "react-icons/fa";
import { IoCloseCircleOutline } from "react-icons/io5";
import styles from "./VideoFeedItem.module.css";
import VideoFeedItemActionsModal from "./VideoFeedItemActionsModal/VideoFeedItemActionsModal";
import DeleteFeedModal from "../DeleteFeedModal/DeleteFeedModal";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../../context/AuthProvider";
import { useUser } from "../../../../context/UserContext";
import axios from "axios";
import { auth, db } from "../../../../config/firebase-client";
import { collection, doc, onSnapshot, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import api from "../../../../utils/axios";

// Debounce helper
function debounce(func, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// YouTube Embed URL generator
function getYouTubeEmbedUrl(url) {
  if (!url || typeof url !== "string") return null;

  let videoIdMatch;
  if (url.includes("/embed/")) {
    const embedId = url.split("/embed/")[1].split("?")[0];
    videoIdMatch = [url, embedId];
  } else {
    videoIdMatch = url.match(/(?:\/shorts\/|youtu\.be\/|v=)([^&?\/]+)/);
  }

  if (videoIdMatch && videoIdMatch[1]) {
    const videoId = videoIdMatch[1];
    const params = new URLSearchParams({
      autoplay: 1,
      muted: 0,
      loop: 1,
      controls: 1,
      playlist: videoId,
      modestbranding: 1,
    });
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  }

  return null;
}

// HOOK: item actions (like, save, comment, share)
export function useItemActions({
  id,
  itemType = "feeds",
  initialLiked = false,
  initialSaved = false,
}) {
  const { showToast } = useAuth();
  const [liked, setLiked] = useState(initialLiked);
  const [saved, setSaved] = useState(initialSaved);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0); 
  const [shareCount, setShareCount] = useState(0);
  const isUpdating = useRef(false);

  const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  });

  // Firebase listener - like state
  useEffect(() => {
    if (!id) return;
    const user = auth.currentUser;
    if (!user) {
      setLiked(initialLiked);
      return;
    }

    let likeDocRef;
    if (itemType === "posts") {
      likeDocRef = doc(db, "posts", id, "likes", user.uid);
    } else {
      likeDocRef = doc(db, "users", user.uid, "likes", id);
    }

    const unsubscribe = onSnapshot(likeDocRef, (docSnap) => {
      setLiked(docSnap.exists());
    });

    return () => unsubscribe();
  }, [id, itemType, initialLiked]);

  // Firebase listener - stats
 useEffect(() => {
    if (!id) return;
    const statsRef =
      itemType === "posts" ? doc(db, "posts", id) : doc(db, "globalFeeds", id);
    
    // ✅ Yorum sayısını alt koleksiyondan almak için yeni listener
    const commentsCollectionRef = collection(statsRef, "comments");
    const unsubscribeComments = onSnapshot(commentsCollectionRef, (snapshot) => {
      setCommentCount(snapshot.size); // Koleksiyondaki belge sayısını kullan
    });

    // Mevcut like ve share count listener
    const unsubscribeStats = onSnapshot(statsRef, (docSnap) => {
      if (!docSnap.exists()) return;
      const data = docSnap.data();
      if (itemType === "posts") {
        setLikeCount(Number(data?.stats?.likes) || 0);
        setShareCount(Number(data?.stats?.shares) || 0);
      } else {
        setLikeCount(Number(data?.likes) || 0);
        setShareCount(Number(data?.shares) || 0);
      }
    });
    
    // İki listener'ı da temizlediğimizden emin olmalıyız
    return () => {
      unsubscribeComments();
      unsubscribeStats();
    };
  }, [id, itemType]);

  // LIKE handler
  const handleLike = async () => {
    if (isUpdating.current) return;
    isUpdating.current = true;

    const user = auth.currentUser;
    if (!user) {
      showToast("Bu işlemi yapmak için lütfen giriş yapın.", "error");
      isUpdating.current = false;
      return;
    }

    try {
      // 🔹 Firebase Firestore tarafında local güncelleme
      if (itemType === "posts") {
        const likeDocRef = doc(db, "posts", id, "likes", user.uid);
        const likeDoc = await getDoc(likeDocRef);

        if (likeDoc.exists()) {
          await deleteDoc(likeDocRef);
          setLikeCount((prev) => Math.max(Number(prev) - 1, 0));
        } else {
          await setDoc(likeDocRef, { uid: user.uid, likedAt: new Date() });
          setLikeCount((prev) => Number(prev) + 1);
        }
      }

      // 🔹 Backend API çağrısı
      const token = await user.getIdToken(); // Firebase ID Token
      const endpoint =
        itemType === "posts"
          ? "/api/posts/like-toggle"
          : "/api/feeds/feed-like-toggle";

      const body =
        itemType === "posts"
          ? { postId: id, postType: "posts" }
          : { feedId: id, feedType: "globalFeeds" };

      const res = await api.post(endpoint, body, {
        headers: { Authorization: `Bearer ${token}` },
      });

    } catch (err) {
      console.error("Beğeni hatası:", err.response?.data || err.message);
      showToast("Beğeni işlemi başarısız oldu.", "error");
    } finally {
      isUpdating.current = false;
    }
  };

  // SAVE handler (debounced)
  const debouncedToggleSave = useCallback(
    debounce(async () => {
      if (isUpdating.current) return;
      isUpdating.current = true;
      try {
        const token = await auth.currentUser?.getIdToken();
        const endpoint =
          itemType === "posts"
            ? "/api/posts/save-toggle"
            : "/api/feeds/feed-save-toggle"; // 🔹 feed için güncel
        const body =
          itemType === "posts"
            ? { postId: id, postType: "posts" }
            : { feedId: id, feedType: "globalFeeds" };

        await api.post(endpoint, body, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        console.error("Kaydetme hatası:", error);
        setSaved((prev) => !prev);
        showToast("Kaydetme işlemi başarısız oldu.", "error");
      } finally {
        isUpdating.current = false;
      }
    }, 500),
    [id, itemType]
  );

  const handleSave = () => {
    setSaved((prev) => {
      const next = !prev;
      debouncedToggleSave();
      return next;
    });
  };

  // COMMENT count update
  const handleCommentAdded = () => {
    setCommentCount((prev) => Number(prev) + 1);
  };

  // SHARE handler
  const handleShare = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const endpoint =
        itemType === "posts"
          ? "/api/posts/share-post"
          : "/api/feeds/feed-share-post"; // 🔹 feed için güncel
      const body = itemType === "posts" ? { postId: id } : { feedId: id };

      await api.post(endpoint, body, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShareCount((prev) => Number(prev) + 1);
    } catch (error) {
      console.error("Paylaşım hatası:", error);
      showToast("Paylaşım işlemi başarısız oldu.", "error");
    }
  };

  return {
    liked,
    saved,
    likeCount,
    commentCount,
    shareCount,
    handleLike,
    handleSave,
    handleCommentAdded,
    handleShare,
  };
}

// COMPONENT: Video Feed Item
export default function VideoFeedItem(props) {
  const {
    videoSrc,
    description,
    username,
    userProfileImage,
    onClose,
    isMobile,
    feed,
    initialLiked,
    initialSaved,
  } = props;
  const { currentUser } = useUser();
  const { showToast } = useAuth();
  const [doubleTap, setDoubleTap] = useState(false);
  const [followed, setFollowed] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Yeni state

  const feedId = feed?._id || feed?.id || feed?.feedId;
  const {
    liked,
    saved,
    likeCount,
    commentCount,
    handleLike,
    handleSave,
    handleCommentAdded,
    handleShare,
  } = useItemActions({
    id: feedId,
    itemType: "feeds",
    initialLiked,
    initialSaved,
  });

  const embedUrl = getYouTubeEmbedUrl(videoSrc);
  if (!embedUrl) return null;

  const handleDoubleClick = () => {
    setDoubleTap(true);
    handleLike();
    setTimeout(() => setDoubleTap(false), 1000);
  };

  const handleDeleteFeed = async () => {
    if (!feedId) {
      showToast("Gönderi bilgisi eksik.", "error");
      return;
    }

    try {
      const feedRef = doc(db, "globalFeeds", feedId);
      await deleteDoc(feedRef);
      showToast("Gönderi başarıyla silindi.", "success");
      setShowDeleteModal(false);
      onClose(); // Parent component'in gönderiyi kaldırması için
    } catch (error) {
      console.error("Gönderi silme hatası:", error);
      showToast("Gönderi silinirken bir hata oluştu.", "error");
    }
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.videoCard}>
          <div
            className={styles.videoWrapper}
            onDoubleClick={handleDoubleClick}
          >
            <iframe
              className={styles.videoFrame}
              src={embedUrl}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <AnimatePresence>
              {doubleTap && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                  }}
                  className={styles.heartAnimation}
                >
                  <FaHeart />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className={styles.infoCard}>
            <div className={styles.userInfo}>
              <img
                src={userProfileImage || "https://i.pravatar.cc/48"}
                alt={username || "Anonim Kullanıcı"}
                className={styles.userAvatar}
              />
              <div className={styles.userInfoText}>
                <span className={styles.userName}>
                  {username || "Anonim Kullanıcı"}
                </span>
                <div className={styles.description}>{description}</div>
              </div>
              <button
                onClick={() => setFollowed((p) => !p)}
                className={styles.followButton}
              >
                {followed ? "Takibi Bırak" : "Takip Et"}
              </button>
            </div>
          </div>
        </div>
        <div className={styles.actionButtons}>
          {isMobile && onClose && (
            <button
              className={styles.closeButton}
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            >
              <IoCloseCircleOutline className={styles.iconItem} />
            </button>
          )}
          <div className={styles.iconWrapper} onClick={handleLike}>
            {liked ? (
              <FaHeart className={`${styles.iconItem} ${styles.likedIcon}`} />
            ) : (
              <FiHeart className={styles.iconItem} />
            )}
            <span className={styles.actionCount}>{likeCount}</span>
          </div>
          <div
            className={styles.iconWrapper}
            onClick={() => setShowCommentModal(true)}
          >
            <FiMessageCircle className={styles.iconItem} />
            <span className={styles.actionCount}>{commentCount}</span>
          </div>
          <div className={styles.iconWrapper} onClick={handleSave}>
            {saved ? (
              <FaBookmark
                className={`${styles.iconItem} ${styles.savedIcon}`}
              />
            ) : (
              <FiBookmark className={styles.iconItem} />
            )}
          </div>
          <div className={styles.iconWrapper} onClick={handleShare}>
            <FiSend className={styles.iconItem} />
          </div>
          {/* Sadece gönderi sahibi için Silme butonu göster */}
          {currentUser?.uid === feed?.uid && (
            <div
              className={styles.iconWrapper}
              onClick={() => setShowDeleteModal(true)}
            >
              <FiMoreVertical className={styles.iconItem} />
            </div>
          )}
        </div>
      </div>
      {showCommentModal && (
        <VideoFeedItemActionsModal
          show={showCommentModal}
          onClose={() => setShowCommentModal(false)}
          feed={feed}
          initialTab="comments"
          onCommentAdded={handleCommentAdded}
        />
      )}
      {/* Yeni modalı ekle */}
      <DeleteFeedModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDeleteFeed}
      />
    </>
  );
}