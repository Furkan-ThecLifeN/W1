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
import { auth, db } from "../../../../config/firebase-client";
import { doc, getDoc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import PostsActionsModal from "./PostsActionsModal/PostsActionsModal";

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
  const [commentCount, setCommentCount] = useState(
    Number(post?.stats?.comments) || 0
  );
  const [shareCount, setShareCount] = useState(
    Number(post?.stats?.shares) || 0
  );
  const [saved, setSaved] = useState(initialSaved);
  const [showModal, setShowModal] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState("comments");
  const isUpdating = useRef(false);

  const postId = post?._id || post?.id;
  const { caption, displayName, photoURL, imageUrls } = post || {};
  const imageUrl = imageUrls?.length > 0 ? imageUrls[0] : null;

  const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  });

  // Firestore realtime listener ile like durumunu takip et
  useEffect(() => {
    if (!postId) return;
    const user = auth.currentUser;
    if (!user) return;

    const likeDocRef = doc(db, "posts", postId, "likes", user.uid);

    const unsubscribe = onSnapshot(likeDocRef, (docSnap) => {
      const exists = docSnap.exists();
      setLiked(exists);
    });

    return () => unsubscribe();
  }, [postId]);

  // Stats değerlerini UI'ya yükle
  useEffect(() => {
    setLikeCount(Number(post?.stats?.likes) || 0);
    setCommentCount(Number(post?.stats?.comments) || 0);
    setShareCount(Number(post?.stats?.shares) || 0);
  }, [post?.stats?.likes, post?.stats?.comments, post?.stats?.shares]);

  const handleLike = async () => {
    if (isUpdating.current) return;
    isUpdating.current = true;

    const user = auth.currentUser;
    if (!user) {
      showToast("Bu işlemi yapmak için lütfen giriş yapın.", "error");
      isUpdating.current = false;
      return;
    }

    const likeDocRef = doc(db, "posts", postId, "likes", user.uid);

    try {
      const likeDoc = await getDoc(likeDocRef);

      if (likeDoc.exists()) {
        await deleteDoc(likeDocRef); // beğeniyi kaldır
        setLikeCount((prev) => prev - 1);
      } else {
        await setDoc(likeDocRef, { uid: user.uid, likedAt: new Date() }); // beğen
        setLikeCount((prev) => prev + 1);
      }

      // Backend toggle API çağrısı
      const token = await user.getIdToken();
      await api.post(
        "/api/posts/like-toggle",
        { postId, postType: "posts" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

    } catch (err) {
      console.error("Beğeni hatası:", err);
      showToast("Beğeni işlemi başarısız oldu.", "error");
    } finally {
      isUpdating.current = false;
    }
  };

  const handleSave = () => {
    const previousSaved = saved;
    setSaved(!previousSaved);
    debouncedToggleSave(!previousSaved);
  };

  const debouncedToggleSave = useCallback(
    debounce(async (isSavedNow) => {
      if (isUpdating.current) return;
      isUpdating.current = true;
      try {
        const token = await auth.currentUser?.getIdToken();
        await api.post(
          "/api/posts/save-toggle",
          { postId, postType: "posts" },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error("Kaydetme hatası:", error);
        setSaved(!isSavedNow);
        showToast("Kaydetme işlemi başarısız oldu.", "error");
      } finally {
        isUpdating.current = false;
      }
    }, 500),
    [postId]
  );

  const handleCommentUpdate = () => {
    setCommentCount((prev) => Number(prev) + 1);
  };

  const handleShareUpdate = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      await api.post(
        "/api/posts/share-post",
        { postId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShareCount((prev) => Number(prev) + 1);
    } catch (error) {
      console.error("Paylaşım hatası:", error);
      showToast("Paylaşım işlemi başarısız oldu.", "error");
    }
  };

  const postText = post?.caption || "";
  const userProfileImage =
    photoURL ||
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";

  return (
    <>
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
