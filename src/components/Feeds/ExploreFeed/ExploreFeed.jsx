import React, { useState, useEffect, useRef } from "react";
import { db } from "../../../config/firebase-client";
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import PostVideoCard from "../FeedVideoCard/FeedVideoCard"; 
import styles from "./ExploreFeed.module.css";
import LoadingOverlay from "../../LoadingOverlay/LoadingOverlay";
import { FiArrowDown, FiArrowUp } from "react-icons/fi";

export default function ExploreFeed() {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const feedRef = useRef(null);
  const startYRef = useRef(null);
  const threshold = 20; // Kaydırma hassasiyeti

  useEffect(() => {
    async function fetchInitialFeed() {
      try {
        const feedsCollection = collection(db, "globalFeeds");
        const q = query(feedsCollection, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        const feedsData = [];
        for (const docRef of snapshot.docs) {
          const feedData = { id: docRef.id, ...docRef.data() };

          if (feedData.privacy && feedData.privacy !== "public") continue;

          if (
            feedData.mediaUrl &&
            typeof feedData.mediaUrl === "string" &&
            (
              feedData.mediaUrl.includes("youtube.com/shorts/") ||
              feedData.mediaUrl.includes("youtu.be/") ||
              feedData.mediaUrl.includes("youtube.com/embed/")
            )
          ) {
            if (feedData.ownerId) {
              const userRef = doc(db, "users", feedData.ownerId);
              const userSnap = await getDoc(userRef);
              if (userSnap.exists()) {
                const userData = userSnap.data();
                feedData.uid = feedData.ownerId;
                feedData.username = feedData.username || userData.username || "Anonim Kullanıcı";
                feedData.userProfileImage = feedData.userProfileImage || userData.photoURL || "https://i.pravatar.cc/48";
              } else {
                feedData.uid = feedData.ownerId;
                feedData.username = "Kullanıcı Bulunamadı";
                feedData.userProfileImage = "https://i.pravatar.cc/48";
              }
            } else {
              feedData.username = "Anonim Kullanıcı";
              feedData.userProfileImage = "https://i.pravatar.cc/48";
            }

            feedsData.push(feedData);
          }
        }

        setFeeds(feedsData);
        setLoading(false);
      } catch (err) {
        console.error("Feed yüklenemedi:", err);
        setError("Feed yüklenemedi.");
        setLoading(false);
      }
    }

    fetchInitialFeed();
  }, []);

  // Mobil kaydırma
  useEffect(() => {
    if (!feedRef.current) return;

    const handleTouchStart = (e) => {
      startYRef.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      const endY = e.changedTouches[0].clientY;
      const deltaY = startYRef.current - endY;

      if (Math.abs(deltaY) < threshold) return;

      if (deltaY > 0) handleNextVideo(); // Yukarı kaydırma -> sonraki
      else handlePrevVideo();            // Aşağı kaydırma -> önceki
    };

    const currentRef = feedRef.current;
    currentRef.addEventListener("touchstart", handleTouchStart);
    currentRef.addEventListener("touchend", handleTouchEnd);

    return () => {
      currentRef.removeEventListener("touchstart", handleTouchStart);
      currentRef.removeEventListener("touchend", handleTouchEnd);
    };
  }, [activeIndex, feeds]);

  const handleNextVideo = () => {
    if (activeIndex < feeds.length - 1) {
      setActiveIndex(activeIndex + 1);
    }
  };

  const handlePrevVideo = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  if (loading) return <LoadingOverlay />;
  if (error) return <div className={styles.feed}><p>{error}</p></div>;
  if (feeds.length === 0)
    return (
      <div className={styles.feed}>
        <p>Henüz keşfedilecek feed yok. İlk paylaşımı siz yapın!</p>
      </div>
    );

  const currentFeed = feeds[activeIndex];

  return (
    <div className={styles.feed} ref={feedRef}>
      {currentFeed && <PostVideoCard key={currentFeed.id} data={currentFeed} />}

      {/* Büyük ekran navigasyon butonları */}
      {activeIndex > 0 && (
        <button className={`${styles.navButton} ${styles.prevButton}`} onClick={handlePrevVideo}>
          <FiArrowUp size={32} color="#fff" />
        </button>
      )}
      {activeIndex < feeds.length - 1 && (
        <button className={`${styles.navButton} ${styles.nextButton}`} onClick={handleNextVideo}>
          <FiArrowDown size={32} color="#fff" />
        </button>
      )}
    </div>
  );
}
