import React, { useState, useEffect } from "react";
import { db } from '../../../config/firebase-client';
import { collection, onSnapshot, query, where, orderBy, getDoc, doc } from 'firebase/firestore';
import PostVideoCard from "../PostVideoCard/PostVideoCard";
import styles from "./ExploreFeed.module.css";
import { motion, AnimatePresence } from "framer-motion";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function ExploreFeed() {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const feedsCollection = collection(db, 'globalFeeds');
    const q = query(feedsCollection, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const feedsPromises = snapshot.docs.map(async (docRef) => {
          const feedData = {
            id: docRef.id,
            ...docRef.data()
          };

          // YouTube Shorts videolarını filtrele
          if (feedData.mediaUrl && typeof feedData.mediaUrl === 'string' &&
              (feedData.mediaUrl.indexOf('youtube.com/shorts/') !== -1 ||
               feedData.mediaUrl.indexOf('youtu.be/') !== -1)) {
            
            // Kullanıcı bilgilerini çek
            if (feedData.ownerId) {
              const userRef = doc(db, 'users', feedData.ownerId);
              const userSnap = await getDoc(userRef);
              if (userSnap.exists()) {
                const userData = userSnap.data();
                feedData.username = userData.username || 'Anonim Kullanıcı';
                feedData.userProfileImage = userData.photoURL || 'https://i.pravatar.cc/48';
              } else {
                feedData.username = 'Kullanıcı Bulunamadı';
                feedData.userProfileImage = 'https://i.pravatar.cc/48';
              }
            } else {
              feedData.username = 'Anonim Kullanıcı';
              feedData.userProfileImage = 'https://i.pravatar.cc/48';
            }
            return feedData;
          }
          return null;
        });

        const resolvedFeeds = await Promise.all(feedsPromises);
        const validFeeds = resolvedFeeds.filter(feed => feed !== null);
        setFeeds(validFeeds);
        setLoading(false);
      } catch (err) {
        console.error("Feeds çekme hatası: ", err);
        setError("Feeds çekilirken bir hata oluştu.");
        setLoading(false);
      }
    }, (err) => {
      console.error("Firestore dinleme hatası: ", err);
      setError("Veritabanı bağlantı hatası.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className={styles.feed}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className={styles.skeletonContainer}>
            <Skeleton height={500} className={styles.skeletonPost} />
          </div>
        ))}
      </div>
    );
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

  return (
    <div className={styles.feed}>
      <AnimatePresence>
        {feeds.map((feed) => (
          <motion.div
            key={feed.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
          >
            <PostVideoCard
              videoSrc={feed.mediaUrl}
              description={feed.description}
              username={feed.username}
              userProfileImage={feed.userProfileImage}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}