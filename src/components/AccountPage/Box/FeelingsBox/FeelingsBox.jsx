import React, { useState, useEffect, useRef } from "react";
import styles from "./FeelingsBox.module.css";
import { FiMoreHorizontal, FiMessageCircle, FiSend, FiBookmark } from "react-icons/fi";
import { FaHeart, FaBookmark } from "react-icons/fa";
import { useUser } from "../../../../context/UserContext";
import { useAuth } from "../../../../context/AuthProvider";
import ActionsModal from "../ActionsModal/ActionsModal";
import axios from "axios";
import { auth, db } from "../../../../config/firebase-client";
import { doc, getDoc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";

const FeelingsBox = ({ feeling, initialSaved }) => {
  const { currentUser } = useUser();
  const { showToast } = useAuth();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(initialSaved);
  const [showModal, setShowModal] = useState(false);
  const [likeCount, setLikeCount] = useState(feeling?.stats?.likes || 0);
  const [commentCount, setCommentCount] = useState(feeling?.stats?.comments || 0);
  const [shareCount, setShareCount] = useState(feeling?.stats?.shares || 0);
  const [activeModalTab, setActiveModalTab] = useState("comments");
  const isUpdating = useRef(false);

  const { caption, text, displayName, photoURL, imageUrls, images } = feeling || {};
  const postId = feeling?.id;
  const postType = feeling?.privacy === "public" ? "globalFeelings" : "feelings";

  const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: { "Content-Type": "application/json" },
  });

  // Firestore realtime like listener
  useEffect(() => {
    if (!postId || !currentUser) return;

    const likeDocRef = doc(db, postType, postId, "likes", currentUser.uid);
    const postRef = doc(db, postType, postId);

    const unsubscribeLike = onSnapshot(likeDocRef, (docSnap) => {
      setLiked(docSnap.exists());
    });

    const unsubscribeCount = onSnapshot(postRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setLikeCount(data?.stats?.likes || 0);
      }
    });

    return () => {
      unsubscribeLike();
      unsubscribeCount();
    };
  }, [postId, postType, currentUser]);

  // Like işlemi
  const handleLike = async () => {
    if (!currentUser || isUpdating.current) return;
    isUpdating.current = true;

    const likeDocRef = doc(db, postType, postId, "likes", currentUser.uid);
    try {
      const likeDoc = await getDoc(likeDocRef);

      if (likeDoc.exists()) {
        await deleteDoc(likeDocRef);
        setLikeCount((prev) => prev - 1);
      } else {
        await setDoc(likeDocRef, { uid: currentUser.uid, likedAt: new Date() });
        setLikeCount((prev) => prev + 1);
      }

      const token = await auth.currentUser.getIdToken();
      await api.post(
        "/api/actions/toggle-like",
        { postId, postType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Beğeni hatası:", error);
      setLiked((prev) => !prev);
      showToast("Beğeni işlemi başarısız oldu", "error");
    } finally {
      isUpdating.current = false;
    }
  };

  // Save işlemi
  const handleSave = async () => {
    if (!currentUser) return;
    setSaved((prev) => !prev);
    try {
      const token = await auth.currentUser?.getIdToken();
      await api.post(
        "/api/actions/toggle-save",
        { postId, postType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      setSaved((prev) => !prev);
      showToast("Kaydetme işlemi başarısız oldu. Lütfen tekrar deneyin.", "error");
    }
  };

  const handleCommentUpdate = (newCommentCount) => setCommentCount(newCommentCount);
  const handleShareUpdate = (newShareCount) => setShareCount(newShareCount);

  const postText = caption || text || "";
  const postDisplayName = displayName || "Kullanıcı";
  const userProfileImage =
    photoURL ||
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";
  const postImages = imageUrls || images || [];

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.user}>
          <div className={styles.avatar_widget}>
            <img src={userProfileImage} alt={postDisplayName} className={styles.avatar} />
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
        <p>{postText}</p>
        {postImages.length > 0 && (
          <div className={styles.image_container}>
            {postImages.map((img, index) => (
              <img key={index} src={img} alt={`Post görseli ${index + 1}`} className={styles.post_image} />
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
          {saved ? <FaBookmark className={styles.icon} /> : <FiBookmark className={styles.icon} />}
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
