import React, { useEffect, useCallback, useRef } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  where,
} from "firebase/firestore";
import { db } from "../../config/firebase-client";
import { useHomeStore } from "../../Store/useHomeStore";

import Sidebar from "../../components/LeftSideBar/Sidebar";
import RightSidebar from "../../components/RightSideBar/RightSideBar";
import BottomNav from "../../components/BottomNav/BottomNav";
import LoadingOverlay from "../../components/LoadingOverlay/LoadingOverlay";

import PostCard from "../../components/Post/PostCard";
import VideoPostCard from "../../components/VideoPostCard/VideoPostCard";
import TweetCard from "../../components/TweetCard/TweetCard";
import QuoteCard from "../../components/QuoteCard/QuoteCard";
import MemePostCard from "../../components/MemePostCard/MemePostCard";
import PhotoCard from "../../components/AIPhotoCard/AIPhotoCard";
import Footer from "../../components/Footer/Footer";

import PublicStoryBar from "../../components/PublicStoryBar/PublicStoryBar";

import styles from "./HomePage.module.css";

const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;
const FIREBASE_BATCH_SIZE = 5;
const JSON_BATCH_SIZE = 18;

const Home = () => {
  const {
    activeView,
    firebaseFeed,
    jsonFeed,
    loading,
    postsExhausted,
    feelingsExhausted,
    jsonExhausted,
    initialLoadDone,
    usersCache = {},
    setState,
  } = useHomeStore();

  const lastPostDocRef = useRef(null);
  const lastFeelingDocRef = useRef(null);
  const usersCacheRef = useRef(usersCache);

  const jsonCacheRef = useRef({
    videos: null,
    tweets: null,
    memes: null,
    photos: null,
    loaded: false,
  });

  const jsonPointersRef = useRef({
    videos: 0,
    tweets: 0,
    memes: 0,
    photos: 0,
  });

  const getSeenIds = (key) => {
    try {
      const stored = JSON.parse(localStorage.getItem(key) || "{}");
      const now = Date.now();
      const filtered = {};
      for (const [id, ts] of Object.entries(stored)) {
        if (now - ts < FIFTEEN_DAYS_MS) filtered[id] = ts;
      }
      localStorage.setItem(key, JSON.stringify(filtered));
      return new Set(Object.keys(filtered));
    } catch {
      localStorage.setItem(key, "{}");
      return new Set();
    }
  };

  const markAsSeen = (key, id) => {
    try {
      const stored = JSON.parse(localStorage.getItem(key) || "{}");
      stored[id] = Date.now();
      localStorage.setItem(key, JSON.stringify(stored));
    } catch {
      localStorage.setItem(key, JSON.stringify({ [id]: Date.now() }));
    }
  };

  const shuffleSmall = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const loadNextFirebaseBatch = useCallback(async () => {
    if (loading || (postsExhausted && feelingsExhausted)) return;
    setState({ loading: true });

    try {
      const fetchFS = async (
        ref,
        lastDocRef,
        exhausted,
        exhaustedKey,
        seenKey,
        type
      ) => {
        if (exhausted) return [];
        const seenIds = getSeenIds(seenKey);
        let unseenDocs = [];
        let continueFetching = true;
        let localExhausted = false;

        while (unseenDocs.length === 0 && continueFetching && !localExhausted) {
          let q;
          if (lastDocRef.current) {
            q = query(
              ref,
              orderBy("createdAt", "desc"),
              startAfter(lastDocRef.current),
              limit(FIREBASE_BATCH_SIZE)
            );
          } else {
            q = query(
              ref,
              orderBy("createdAt", "desc"),
              limit(FIREBASE_BATCH_SIZE)
            );
          }
          const snap = await getDocs(q);

          if (snap.empty || snap.docs.length < FIREBASE_BATCH_SIZE) {
            localExhausted = true;
            continueFetching = false;
          }

          if (!snap.empty) {
            lastDocRef.current = snap.docs[snap.docs.length - 1];
            const filteredDocs = snap.docs
              .map((doc) => ({
                id: doc.id,
                ...doc.data(),
                type,
                source: "firebase",
              }))
              .filter((doc) => !seenIds.has(doc.id));

            if (filteredDocs.length > 0) {
              unseenDocs = filteredDocs;
              continueFetching = false;
            }
          }
        }

        if (localExhausted) {
          return { items: [], exhausted: true };
        }

        unseenDocs.forEach((doc) => markAsSeen(seenKey, doc.id));
        return { items: unseenDocs, exhausted: false };
      };

      const [postsRes, feelingsRes] = await Promise.all([
        fetchFS(
          collection(db, "globalPosts"),
          lastPostDocRef,
          postsExhausted,
          "postsExhausted",
          "seenFirebasePosts",
          "post"
        ),
        fetchFS(
          collection(db, "globalFeelings"),
          lastFeelingDocRef,
          feelingsExhausted,
          "feelingsExhausted",
          "seenFirebaseFeelings",
          "feeling"
        ),
      ]);

      const posts = postsRes.items || [];
      const feelings = feelingsRes.items || [];

      if (postsRes.exhausted) setState({ postsExhausted: true });
      if (feelingsRes.exhausted) setState({ feelingsExhausted: true });

      const preliminaryBatch = shuffleSmall([...posts, ...feelings]);
      let newBatchWithUsers = [];

      if (preliminaryBatch.length > 0) {
        const localUsersCache = { ...usersCacheRef.current };
        const uidsToFetch = new Set();
        for (const item of preliminaryBatch) {
          if (item.uid && !localUsersCache[item.uid]) uidsToFetch.add(item.uid);
        }

        if (uidsToFetch.size > 0) {
          const uidsArray = Array.from(uidsToFetch);
          const fetchUsersPromises = [];
          for (let i = 0; i < uidsArray.length; i += 30) {
            const chunk = uidsArray.slice(i, i + 30);
            const usersQuery = query(
              collection(db, "users"),
              where("uid", "in", chunk)
            );
            fetchUsersPromises.push(getDocs(usersQuery));
          }
          const usersSnaps = await Promise.all(fetchUsersPromises);
          usersSnaps.forEach((snap) => {
            snap.forEach((userDoc) => {
              const userData = userDoc.data();
              if (userData.uid) localUsersCache[userData.uid] = userData;
            });
          });
          usersCacheRef.current = localUsersCache;
          setState({ usersCache: localUsersCache });
        }

        newBatchWithUsers = preliminaryBatch.map((item) => {
          const fresh = usersCacheRef.current[item.uid];
          if (fresh) {
            return {
              ...item,
              displayName: fresh.displayName,
              photoURL: fresh.photoURL,
              username: fresh.username,
            };
          }
          return item;
        });
      }

      setState({
        firebaseFeed: [...firebaseFeed, ...newBatchWithUsers],
        initialLoadDone: { ...initialLoadDone, firebase: true },
      });
    } catch (err) {
      console.error("Firebase batch yükleme hatası:", err);
    } finally {
      setState({ loading: false });
    }
  }, [
    loading,
    postsExhausted,
    feelingsExhausted,
    firebaseFeed,
    initialLoadDone,
    setState,
  ]);

  const loadJsonOnce = useCallback(async () => {
    if (jsonCacheRef.current.loaded) return jsonCacheRef.current;
    try {
      const [videosRes, tweetsRes, memesRes, photosRes] = await Promise.all([
        fetch("/explore.json"),
        fetch("/tweets.json"),
        fetch("/memes.json"),
        fetch("/pinterest.json"),
      ]);
      const [videos, tweets, memes, photos] = await Promise.all([
        videosRes.ok ? videosRes.json() : [],
        tweetsRes.ok ? tweetsRes.json() : [],
        memesRes.ok ? memesRes.json() : [],
        photosRes.ok ? photosRes.json() : [],
      ]);
      jsonCacheRef.current = { videos, tweets, memes, photos, loaded: true };
    } catch (e) {
      jsonCacheRef.current = {
        videos: [],
        tweets: [],
        memes: [],
        photos: [],
        loaded: true,
      };
      console.error("JSON yükleme hatası", e);
    }
    return jsonCacheRef.current;
  }, []);

  const pickFromPool = (poolName, count, seenKey, type) => {
    const pool = jsonCacheRef.current[poolName] || [];
    const seen = getSeenIds(seenKey);
    const pointer = jsonPointersRef.current[poolName] || 0;
    const result = [];
    let idx = pointer;
    while (result.length < count && idx < pool.length) {
      const item = pool[idx];
      idx += 1;
      if (!item) continue;
      const idStr = item.id != null ? item.id.toString() : null;
      if (idStr && seen.has(idStr)) continue;
      if (idStr) markAsSeen(seenKey, idStr);
      result.push({
        ...item,
        id: idStr || `${poolName}-${idx}`,
        type,
        source: "json",
      });
    }
    jsonPointersRef.current[poolName] = idx;
    return result;
  };

  const loadNextJsonBatch = useCallback(async () => {
    if (loading || jsonExhausted) return;
    setState({ loading: true });

    try {
      await loadJsonOnce();
      const videos = pickFromPool("videos", 2, "seenVideos", "video");
      const tweets = pickFromPool("tweets", 2, "seenTweets", "quote");
      const memes = pickFromPool("memes", 2, "seenMemes", "image");
      const photos = pickFromPool("photos", 2, "seenPhotos", "photo");

      const sets = [];
      const numSets = Math.max(1, Math.floor(JSON_BATCH_SIZE / 6));
      for (let i = 0; i < numSets; i++) {
        const set = [
          ...videos.splice(0, 2),
          ...tweets.splice(0, 2),
          ...memes.splice(0, 2),
          ...photos.splice(0, 2),
        ].filter(Boolean);
        sets.push(...shuffleSmall(set));
      }

      const newBatch = sets;
      if (newBatch.length === 0) {
        setState({
          jsonExhausted: true,
          initialLoadDone: { ...initialLoadDone, json: true },
        });
        return;
      }

      setState({
        jsonFeed: [...jsonFeed, ...newBatch],
        initialLoadDone: { ...initialLoadDone, json: true },
      });
    } catch (e) {
      console.error("JSON batch yükleme hatası:", e);
      setState({ jsonExhausted: true });
    } finally {
      setState({ loading: false });
    }
  }, [
    loading,
    jsonExhausted,
    jsonFeed,
    setState,
    loadJsonOnce,
    initialLoadDone,
  ]);

  useEffect(() => {
    if (!initialLoadDone.json) loadNextJsonBatch();
  }, [loadNextJsonBatch, initialLoadDone.json]);

  useEffect(() => {
    if (activeView === "firebase" && !initialLoadDone.firebase) {
      loadNextFirebaseBatch();
    }
  }, [activeView, initialLoadDone.firebase, loadNextFirebaseBatch]);

  const currentFeed = activeView === "firebase" ? firebaseFeed : jsonFeed;
  const isExhausted =
    activeView === "firebase"
      ? postsExhausted && feelingsExhausted
      : jsonExhausted;
  const loadMore =
    activeView === "firebase" ? loadNextFirebaseBatch : loadNextJsonBatch;

  const renderItem = (item) => {
    const uniqueKey = `${item.source}-${item.type}-${item.id}`;

    // Sadece photo → PhotoCard
    if (activeView === "json" && item.type === "photo") {
      return <PhotoCard key={uniqueKey} photo={item} />;
    }

    switch (item.type) {
      case "video":
        return <VideoPostCard key={uniqueKey} data={item} />;
      case "quote":
        return <QuoteCard key={uniqueKey} data={item} />;
      case "post":
        return <PostCard key={uniqueKey} data={item} />;
      case "feeling":
        return <TweetCard key={uniqueKey} data={item} />;
      case "image":
        return <MemePostCard key={uniqueKey} meme={item} />;
      default:
        return null;
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
            <div
              className={`${styles.switchSlider} ${
                activeView === "firebase" ? styles.sliderRight : ""
              }`}
            ></div>
            <button
              className={`${styles.switchButton} ${
                activeView === "json" ? styles.active : ""
              }`}
              onClick={() => setState({ activeView: "json" })}
            >
              Eğlence
            </button>
            <button
              className={`${styles.switchButton} ${
                activeView === "firebase" ? styles.active : ""
              }`}
              onClick={() => setState({ activeView: "firebase" })}
            >
              Keşfet
            </button>
          </div>
        </header>

      <div style={{width: '100%', maxWidth: '900px', marginBottom: '10px'}}>
         <PublicStoryBar />
      </div>

        <section className={styles.feed}>
          {currentFeed.map((item) => renderItem(item))}
        </section>

        <footer className={styles.feedFooter}>
          {!loading && !isExhausted && currentFeed.length > 0 && (
            <button onClick={loadMore} className={styles.loadMoreButton}>
              Daha Fazla Göster
            </button>
          )}
          {isExhausted && (
            <p className={styles.exhaustedMessage}>
              Başka gösterilecek gönderi yok.
            </p>
          )}
          {loading && currentFeed.length > 0 && (
            <div className={styles.loadingSpinner}></div>
          )}
          <div className={styles.footerMain}>
            <Footer />
          </div>
        </footer>
      </main>
      <RightSidebar />
      <BottomNav />
    </div>
  );
};

export default Home;
