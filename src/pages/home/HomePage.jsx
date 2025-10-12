import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "../../config/firebase-client";

import Sidebar from "../../components/LeftSideBar/Sidebar";
import RightSidebar from "../../components/RightSideBar/RightSideBar";
import BottomNav from "../../components/BottomNav/BottomNav";
import LoadingOverlay from "../../components/LoadingOverlay/LoadingOverlay";

import PostCard from "../../components/Post/PostCard";
import VideoPostCard from "../../components/VideoPostCard/VideoPostCard";
import TweetCard from "../../components/TweetCard/TweetCard";
import QuoteCard from "../../components/QuoteCard/QuoteCard";

import allVideos from "../../data/explore.json";
import allTweets from "../../data/tweets.json";

import styles from "./HomePage.module.css";

const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;
const BATCH_SIZE = 20; // 4'lü gruplardan 5 tane çekecek (5 * 4 = 20)

const Home = () => {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  // Son dokümanları ref ile saklayarak gereksiz re-render'ları önlüyoruz
  const lastPostDocRef = useRef(null);
  const lastFeelingDocRef = useRef(null);
  
  const [postsExhausted, setPostsExhausted] = useState(false);
  const [feelingsExhausted, setFeelingsExhausted] = useState(false);

  // localStorage'dan görülen ID'leri alır ve 15 günden eski olanları temizler
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

  // Bir ID'yi "görüldü" olarak işaretler
  const markAsSeen = (key, id) => {
    const stored = JSON.parse(localStorage.getItem(key) || "{}");
    stored[id] = Date.now();
    localStorage.setItem(key, JSON.stringify(stored));
  };
  
  // Belirtilen sayıda rastgele ve görülmemiş JSON öğesi seçer (Planınıza uygun)
  const getRandomJsonItems = useCallback((count = 3) => {
    const seenVideos = getSeenIds("seenVideos");
    const seenQuotes = getSeenIds("seenQuotes");

    let availableVideos = allVideos.filter((v) => !seenVideos.has(v.id.toString()));
    let availableQuotes = allTweets.filter((t) => !seenQuotes.has(t.id.toString()));
    
    const selected = [];
    const pickRandomly = (pool, type, seenKey) => {
        if (pool.length === 0) return null;
        const index = Math.floor(Math.random() * pool.length);
        const item = pool.splice(index, 1)[0];
        markAsSeen(seenKey, item.id.toString());
        return { ...item, id: item.id.toString(), type, source: "json" };
    };

    // 1 video ve 1 quote'u garantiye alalım (eğer varsa)
    const firstVideo = pickRandomly(availableVideos, "video", "seenVideos");
    if (firstVideo) selected.push(firstVideo);
    
    const firstQuote = pickRandomly(availableQuotes, "quote", "seenQuotes");
    if (firstQuote) selected.push(firstQuote);
    
    // Kalanları doldur
    while (selected.length < count) {
      const remainingPool = availableVideos.length > 0 ? availableVideos : availableQuotes;
      const type = availableVideos.length > 0 ? "video" : "quote";
      const seenKey = availableVideos.length > 0 ? "seenVideos" : "seenQuotes";
      
      const nextItem = pickRandomly(remainingPool, type, seenKey);
      if (nextItem) {
        selected.push(nextItem);
      } else {
        break; // Havuzda hiç eleman kalmadıysa döngüden çık
      }
    }
    
    return selected;
  }, []);
  
  // Firebase'den "globalPosts" koleksiyonundan veri çeker
  const fetchFirebasePosts = useCallback(async (count = 1) => {
    if (postsExhausted) return [];

    const seenFirebase = getSeenIds("seenFirebasePosts");
    const postsRef = collection(db, "globalPosts");
    let docsToFetch = [];
    let fetchedCount = 0;

    while (fetchedCount < count) {
        const q = lastPostDocRef.current
          ? query(postsRef, orderBy("createdAt", "desc"), startAfter(lastPostDocRef.current), limit(count * 5))
          : query(postsRef, orderBy("createdAt", "desc"), limit(count * 5));

        const snap = await getDocs(q);

        if (snap.empty) {
            setPostsExhausted(true);
            break;
        }

        lastPostDocRef.current = snap.docs[snap.docs.length - 1];
        
        const unseenDocs = snap.docs
            .map(doc => ({ id: doc.id, ...doc.data(), type: "post", source: "firebase" }))
            .filter(doc => !seenFirebase.has(doc.id));
            
        docsToFetch.push(...unseenDocs);
        fetchedCount = docsToFetch.length;

        if (snap.docs.length < (count * 5)) { // Son sayfaya gelindiyse
            setPostsExhausted(true);
            break;
        }
    }
    
    const selected = docsToFetch.slice(0, count);
    selected.forEach((item) => markAsSeen("seenFirebasePosts", item.id));
    return selected;
  }, [postsExhausted]);

  // Firebase'den "globalFeelings" koleksiyonundan veri çeker
  const fetchFirebaseFeelings = useCallback(async (count = 1) => {
    if (feelingsExhausted) return [];

    const seenFirebase = getSeenIds("seenFirebaseFeelings");
    const feelingsRef = collection(db, "globalFeelings");
    let docsToFetch = [];
    let fetchedCount = 0;

    while(fetchedCount < count){
        const q = lastFeelingDocRef.current
          ? query(feelingsRef, orderBy("createdAt", "desc"), startAfter(lastFeelingDocRef.current), limit(count * 5))
          : query(feelingsRef, orderBy("createdAt", "desc"), limit(count * 5));

        const snap = await getDocs(q);

        if (snap.empty) {
            setFeelingsExhausted(true);
            break;
        }

        lastFeelingDocRef.current = snap.docs[snap.docs.length - 1];

        const unseenDocs = snap.docs
            .map(doc => ({ id: doc.id, ...doc.data(), type: "feeling", source: "firebase" }))
            .filter(doc => !seenFirebase.has(doc.id));
        
        docsToFetch.push(...unseenDocs);
        fetchedCount = docsToFetch.length;

        if (snap.docs.length < (count * 5)) {
            setFeelingsExhausted(true);
            break;
        }
    }

    const selected = docsToFetch.slice(0, count);
    selected.forEach((item) => markAsSeen("seenFirebaseFeelings", item.id));
    return selected;
  }, [feelingsExhausted]);

  // Ana yükleme fonksiyonu: Planınıza uygun olarak 4'lü gruplar oluşturur
  const loadNextBatch = useCallback(async () => {
    setLoading(true);
    try {
      const newBatch = [];
      const numGroups = BATCH_SIZE / 4;

      for (let i = 0; i < numGroups; i++) {
        // Adım 1: 3 tane JSON öğesi al
        const jsonItems = getRandomJsonItems(3);
        newBatch.push(...jsonItems);

        const canFetchFirebase = !postsExhausted || !feelingsExhausted;
        
        // Adım 2: Firebase'de veri varsa 1 tane Firebase öğesi al
        if (canFetchFirebase) {
          let firebaseItem = null;
          
          // Rastgele olarak post veya feeling seç
          const pickPostFirst = Math.random() > 0.5;

          if (pickPostFirst && !postsExhausted) {
             const items = await fetchFirebasePosts(1);
             if (items.length > 0) firebaseItem = items[0];
          }
          
          if (!firebaseItem && !feelingsExhausted) {
            const items = await fetchFirebaseFeelings(1);
            if (items.length > 0) firebaseItem = items[0];
          }

          // Eğer ilk denemede (post) gelmediyse ve feeling tükenmemişse, feeling'den almayı dene. Tersi de geçerli.
          if (!firebaseItem && !postsExhausted) {
             const items = await fetchFirebasePosts(1);
             if (items.length > 0) firebaseItem = items[0];
          }

          if (firebaseItem) {
            newBatch.push(firebaseItem);
          }
        }
      }
      setFeed((prev) => [...prev, ...newBatch]);
    } catch (err) {
      console.error("Batch yükleme hatası:", err);
    } finally {
      setLoading(false);
    }
  }, [
    getRandomJsonItems,
    fetchFirebasePosts,
    fetchFirebaseFeelings,
    postsExhausted,
    feelingsExhausted,
  ]);

  // Sadece ilk açılışta verileri yüklemek için
  useEffect(() => {
    loadNextBatch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.home}>
      {loading && feed.length === 0 && <LoadingOverlay />}
      <Sidebar />
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.topCenterLogo}>W1</div>
        </header>

        <section className={styles.feed}>
          {feed.map((item, index) => {
            const uniqueKey = `${item.source}-${item.type}-${item.id}`;
            if (item.type === "video")
              return <VideoPostCard key={uniqueKey} data={item} />;
            if (item.type === "quote")
              return <QuoteCard key={uniqueKey} data={item} />;
            if (item.type === "post")
              return <PostCard key={uniqueKey} data={item} />;
            if (item.type === "feeling")
              return <TweetCard key={uniqueKey} data={item} />;
            return null;
          })}
        </section>

        <footer className={styles.feedFooter}>
            {!loading && (
            <button
                onClick={loadNextBatch}
                className={styles.loadMoreButton}
            >
                Daha Fazla Göster
            </button>
            )}
            {loading && feed.length > 0 && <div className={styles.loadingSpinner}></div>}
        </footer>
      </main>
      <RightSidebar />
      <BottomNav />
    </div>
  );
};

export default Home;