import React, { useEffect, useState, useCallback, useRef } from "react";
import { collection, getDocs, query, orderBy, limit, startAfter } from "firebase/firestore";
import { db } from "../../config/firebase-client";

import Sidebar from "../../components/LeftSideBar/Sidebar";
import RightSidebar from "../../components/RightSideBar/RightSideBar";
import BottomNav from "../../components/BottomNav/BottomNav";
import LoadingOverlay from "../../components/LoadingOverlay/LoadingOverlay";

// Kart bileşenlerini import et
import PostCard from "../../components/Post/PostCard";
import VideoPostCard from "../../components/VideoPostCard/VideoPostCard";
import TweetCard from "../../components/TweetCard/TweetCard";
import QuoteCard from "../../components/QuoteCard/QuoteCard";
import MemePostCard from "../../components/MemePostCard/MemePostCard";
import PhotoCard from "../../components/AIPhotoCard/AIPhotoCard";

// JSON veri kaynaklarını import et
import allVideos from "../../data/explore.json";
import allTweets from "../../data/tweets.json";
import allMemes from "../../data/memes.json";
import allPhotos from "../../data/ai-images.json"; 

import styles from "./HomePage.module.css";

// Ayarlar
const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;
const FIREBASE_BATCH_SIZE = 10;
const JSON_BATCH_SIZE = 18;

const Home = () => {
  const [activeView, setActiveView] = useState("json");
  const [firebaseFeed, setFirebaseFeed] = useState([]);
  const [jsonFeed, setJsonFeed] = useState([]);
  const [loading, setLoading] = useState(false);

  const lastPostDocRef = useRef(null);
  const lastFeelingDocRef = useRef(null);
  const [postsExhausted, setPostsExhausted] = useState(false);
  const [feelingsExhausted, setFeelingsExhausted] = useState(false);
  const [jsonExhausted, setJsonExhausted] = useState(false);

  const initialLoadDone = useRef({ json: false, firebase: false });

  const getSeenIds = (key) => {
    const stored = JSON.parse(localStorage.getItem(key) || "{}");
    const now = Date.now();
    const filtered = {};
    for (const [id, ts] of Object.entries(stored)) {
      if (now - ts < FIFTEEN_DAYS_MS) filtered[id] = ts;
    }
    localStorage.setItem(key, JSON.stringify(filtered));
    return new Set(Object.keys(filtered));
  };

  const markAsSeen = (key, id) => {
    const stored = JSON.parse(localStorage.getItem(key) || "{}");
    stored[id] = Date.now();
    localStorage.setItem(key, JSON.stringify(stored));
  };

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const loadNextFirebaseBatch = useCallback(async () => {
    if (loading || (postsExhausted && feelingsExhausted)) return;
    setLoading(true);

    try {
      const fetchFS = async (ref, lastDocRef, exhausted, setExhausted, key, type) => {
        if (exhausted) return [];
        const seenIds = getSeenIds(key);
        let q;
        if (lastDocRef.current) {
          q = query(ref, orderBy("createdAt", "desc"), startAfter(lastDocRef.current), limit(FIREBASE_BATCH_SIZE));
        } else {
          q = query(ref, orderBy("createdAt", "desc"), limit(FIREBASE_BATCH_SIZE));
        }

        const snap = await getDocs(q);
        if (snap.empty || snap.docs.length < FIREBASE_BATCH_SIZE) setExhausted(true);
        if (!snap.empty) lastDocRef.current = snap.docs[snap.docs.length - 1];

        const unseenDocs = snap.docs
          .map(doc => ({ id: doc.id, ...doc.data(), type, source: "firebase" }))
          .filter(doc => !seenIds.has(doc.id));

        unseenDocs.forEach(doc => markAsSeen(key, doc.id));
        return unseenDocs;
      };

      const posts = await fetchFS(collection(db, "globalPosts"), lastPostDocRef, postsExhausted, setPostsExhausted, "seenFirebasePosts", "post");
      const feelings = await fetchFS(collection(db, "globalFeelings"), lastFeelingDocRef, feelingsExhausted, setFeelingsExhausted, "seenFirebaseFeelings", "feeling");

      const newBatch = shuffleArray([...posts, ...feelings]);
      setFirebaseFeed(prev => [...prev, ...newBatch]);
      initialLoadDone.current.firebase = true;
    } catch (err) {
      console.error("Firebase batch yükleme hatası:", err);
    } finally {
      setLoading(false);
    }
  }, [loading, postsExhausted, feelingsExhausted]);

  const loadNextJsonBatch = useCallback(async () => {
    if (loading || jsonExhausted) return;
    setLoading(true);

    const pickRandomly = (pool, count, seenKey, typeOverride = null) => {
      const seenIds = getSeenIds(seenKey);
      const available = pool.filter(item => !seenIds.has(item.id.toString()));
      if (available.length === 0) return [];

      const selected = [];
      for (let i = 0; i < count; i++) {
        if (available.length === 0) break;
        const index = Math.floor(Math.random() * available.length);
        const item = available.splice(index, 1)[0];
        markAsSeen(seenKey, item.id.toString());
        selected.push({ ...item, id: item.id.toString(), type: typeOverride || (seenKey === 'seenMemes' ? 'image' : (seenKey === 'seenVideos' ? 'video' : 'quote')), source: "json" });
      }
      return selected;
    };

    let newBatch = [];
    const numSets = JSON_BATCH_SIZE / 6;

    for (let i = 0; i < numSets; i++) {
      let set = [];
      set.push(...pickRandomly(allVideos, 2, "seenVideos"));
      set.push(...pickRandomly(allTweets, 2, "seenTweets"));
      set.push(...pickRandomly(allMemes, 2, "seenMemes"));
      set.push(...pickRandomly(allPhotos, 2, "seenPhotos", "photo")); // Foto kartlar eklendi

      newBatch.push(...shuffleArray(set));
    }

    if (newBatch.length < JSON_BATCH_SIZE) setJsonExhausted(true);
    setJsonFeed(prev => [...prev, ...newBatch]);
    initialLoadDone.current.json = true;
    setLoading(false);
  }, [loading, jsonExhausted]);

  useEffect(() => {
    if (!initialLoadDone.current.json) loadNextJsonBatch();
  }, [loadNextJsonBatch]);

  useEffect(() => {
    if (activeView === 'firebase' && !initialLoadDone.current.firebase) {
      loadNextFirebaseBatch();
    }
  }, [activeView, loadNextFirebaseBatch]);

  const currentFeed = activeView === 'firebase' ? firebaseFeed : jsonFeed;
  const isExhausted = activeView === 'firebase' ? (postsExhausted && feelingsExhausted) : jsonExhausted;
  const loadMore = activeView === 'firebase' ? loadNextFirebaseBatch : loadNextJsonBatch;

  const renderItem = (item) => {
    const uniqueKey = `${item.source}-${item.type}-${item.id}`;

    if (activeView === "json" && item.type === "photo") {
      return <PhotoCard key={uniqueKey} photo={item} />;
    }

    switch (item.type) {
      case "video": return <VideoPostCard key={uniqueKey} data={item} />;
      case "quote": return <QuoteCard key={uniqueKey} data={item} />;
      case "post": return <PostCard key={uniqueKey} data={item} />;
      case "feeling": return <TweetCard key={uniqueKey} data={item} />;
      case "image": return <MemePostCard key={uniqueKey} meme={item} />;
      default: return null;
    }
  };

  const showLoadingOverlay = loading && currentFeed.length === 0;

  return (
    <div className={styles.home}>
      {showLoadingOverlay && <LoadingOverlay />}
      <Sidebar />
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.topCenterLogo}>W1</div>
          <div className={styles.feedSwitchContainer}>
            <div className={`${styles.switchSlider} ${activeView === 'firebase' ? styles.sliderRight : ''}`}></div>
            <button 
              className={`${styles.switchButton} ${activeView === 'json' ? styles.active : ''}`}
              onClick={() => setActiveView('json')}
            >
              Eğlence
            </button>
            <button 
              className={`${styles.switchButton} ${activeView === 'firebase' ? styles.active : ''}`}
              onClick={() => setActiveView('firebase')}
            >
              Keşfet
            </button>
          </div>
        </header>

        <section className={styles.feed}>
          {currentFeed.map(item => renderItem(item))}
        </section>

        <footer className={styles.feedFooter}>
          {!loading && !isExhausted && currentFeed.length > 0 && (
            <button onClick={loadMore} className={styles.loadMoreButton}>
              Daha Fazla Göster
            </button>
          )}
          {isExhausted && <p className={styles.exhaustedMessage}>Başka gösterilecek gönderi yok.</p>}
          {loading && currentFeed.length > 0 && <div className={styles.loadingSpinner}></div>}
        </footer>
      </main>
      <RightSidebar />
      <BottomNav />
    </div>
  );
};

export default Home;
