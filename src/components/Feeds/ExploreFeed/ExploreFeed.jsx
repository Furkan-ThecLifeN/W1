import React, { useState, useEffect, useRef } from "react";
import { db } from "../../../config/firebase-client";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  getDoc,
  doc,
} from "firebase/firestore";
import PostVideoCard from "../PostVideoCard/PostVideoCard";
import styles from "./ExploreFeed.module.css";
import LoadingOverlay from "../../LoadingOverlay/LoadingOverlay";
import { FiArrowDown, FiArrowUp } from "react-icons/fi"; // <-- İki ikon da eklendi

export default function ExploreFeed() {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0); 
  
  const feedRef = useRef(null); 

  useEffect(() => {
    const feedsCollection = collection(db, "globalFeeds");
    const q = query(feedsCollection, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        try {
          const feedsPromises = snapshot.docs.map(async (docRef) => {
            const feedData = {
              id: docRef.id,
              ...docRef.data(),
            };

            // YouTube Shorts filtreleme
            if (
              feedData.mediaUrl &&
              typeof feedData.mediaUrl === "string" &&
              (feedData.mediaUrl.includes("youtube.com/shorts/") ||
                feedData.mediaUrl.includes("youtu.be/"))
            ) {
              if (feedData.ownerId) {
                const userRef = doc(db, "users", feedData.ownerId);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                  const userData = userSnap.data();
                  feedData.username = userData.username || "Anonim Kullanıcı";
                  feedData.userProfileImage =
                    userData.photoURL || "https://i.pravatar.cc/48";
                } else {
                  feedData.username = "Kullanıcı Bulunamadı";
                  feedData.userProfileImage = "https://i.pravatar.cc/48";
                }
              } else {
                feedData.username = "Anonim Kullanıcı";
                feedData.userProfileImage = "https://i.pravatar.cc/48";
              }
              return feedData;
            }
            return null;
          });

          const resolvedFeeds = await Promise.all(feedsPromises);
          const validFeeds = resolvedFeeds.filter((feed) => feed !== null);
          setFeeds(validFeeds);
          setLoading(false);
        } catch (err) {
          console.error("Feeds çekme hatası: ", err);
          setError("Feeds çekilirken bir hata oluştu.");
          setLoading(false);
        }
      },
      (err) => {
        console.error("Firestore dinleme hatası: ", err);
        setError("Veritabanı bağlantı hatası.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Buton işlevleri
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

  if (loading) {
    return <LoadingOverlay />;
  }

  if (error) {
    return (
      <div className={styles.feed}>
        <div className={styles.errorState}>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (feeds.length === 0) {
    return (
      <div className={styles.feed}>
        <div className={styles.noFeedsState}>
          <p>Henüz keşfedilecek feeds yok. İlk paylaşımı siz yapın!</p>
        </div>
      </div>
    );
  }

  // Sadece aktif olan videoyu render ediyoruz
  const currentFeed = feeds[activeIndex];

  return (
    <div className={styles.feed} ref={feedRef}>
      {currentFeed && (
        <PostVideoCard
          key={currentFeed.id} 
          videoSrc={currentFeed.mediaUrl}
          description={currentFeed.content}
          username={currentFeed.username}
          userProfileImage={currentFeed.userProfileImage}
        />
      )}
      
      {/* Yukarı kaydırma butonu */}
      {activeIndex > 0 && (
        <button
          className={`${styles.navButton} ${styles.prevButton}`}
          onClick={handlePrevVideo}
        >
          <FiArrowUp size={32} color="#fff" />
        </button>
      )}

      {/* Aşağı kaydırma butonu */}
      {activeIndex < feeds.length - 1 && (
        <button
          className={`${styles.navButton} ${styles.nextButton}`}
          onClick={handleNextVideo}
        >
          <FiArrowDown size={32} color="#fff" />
        </button>
      )}
    </div>
  );
}