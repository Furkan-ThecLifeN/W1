import React, { useState, useEffect, useCallback, useMemo } from "react";
import { db } from "../../../config/firebase-client";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter,
} from "firebase/firestore";
import DiscoverVideoCard from "../DiscoverVideoCard/DiscoverVideoCard";
import DataDiscover from "../../data-discover/DataDiscover";
import allVideos from "../../../data/explore.json";
import styles from "./HybridExploreFeed.module.css";
import { FiArrowDown, FiArrowUp } from "react-icons/fi";
import { useDiscoverStore } from "../../../Store/useDiscoverStore";
import Footer from "../../../components/Footer/Footer"; // ✅ Footer import edildi

const EXPIRATION_DURATION = 14 * 24 * 60 * 60 * 1000;
const FIREBASE_SEEN_KEY = "seenPostIds_fb";
const JSON_SEEN_KEY = "seenPostIds_json";
const FIREBASE_BATCH_SIZE = 5;
const MIX_RATIO = { json: 5, firebase: 1 };

const getAndCleanSeenIds = (storageKey, sourceList = null) => {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return new Set();
    let seenPosts = JSON.parse(stored);
    const now = Date.now();
    const freshPosts = {};
    const validIds = sourceList
      ? new Set(sourceList.map((item) => String(item.id)))
      : null;
    for (const id in seenPosts) {
      const timestamp = seenPosts[id];
      const isFresh = now - timestamp < EXPIRATION_DURATION;
      const isValid = !validIds || validIds.has(String(id));
      if (isFresh && isValid) freshPosts[id] = timestamp;
    }
    localStorage.setItem(storageKey, JSON.stringify(freshPosts));
    return new Set(Object.keys(freshPosts).map(String));
  } catch (e) {
    console.error(`Local storage (${storageKey}) okuma/temizleme hatası:`, e);
    return new Set();
  }
};

const markItemAsSeen = (storageKey, itemId) => {
  try {
    const stored = localStorage.getItem(storageKey);
    const seenPosts = stored ? JSON.parse(stored) : {};
    seenPosts[String(itemId)] = Date.now();
    localStorage.setItem(storageKey, JSON.stringify(seenPosts));
  } catch (e) {
    console.error(`Local storage (${storageKey}) yazma hatası:`, e);
  }
};

const getRandomUnseenJsonVideo = (videoList, allSeenIds) => {
  const unseenVideos = videoList.filter((v) => !allSeenIds.has(String(v.id)));
  if (unseenVideos.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * unseenVideos.length);
  return {
    ...unseenVideos[randomIndex],
    id: String(unseenVideos[randomIndex].id),
    source: "json",
  };
};

export default function HybridExploreFeed() {
  const { exploreFeed, currentIndex, loading, setState } = useDiscoverStore();

  const [isFetching, setIsFetching] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [firebaseExhausted, setFirebaseExhausted] = useState(false);
  const [jsonExhausted, setJsonExhausted] = useState(false);

  const jsonVideoList = useMemo(() => allVideos, []);
  const sessionSeenIds = useMemo(
    () => new Set(exploreFeed.map((item) => String(item.id))),
    [exploreFeed]
  );

  const getNextFirebaseItem = useCallback(async () => {
    if (firebaseExhausted || lastVisible === undefined) return null;
    try {
      const localSeenIds = getAndCleanSeenIds(FIREBASE_SEEN_KEY);
      const feedsCollection = collection(db, "globalFeeds");
      const q = lastVisible
        ? query(
            feedsCollection,
            orderBy("createdAt", "desc"),
            startAfter(lastVisible),
            limit(FIREBASE_BATCH_SIZE)
          )
        : query(
            feedsCollection,
            orderBy("createdAt", "desc"),
            limit(FIREBASE_BATCH_SIZE)
          );

      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        setFirebaseExhausted(true);
        setLastVisible(undefined);
        return null;
      }

      const currentLastVisible = snapshot.docs[snapshot.docs.length - 1];
      setLastVisible(currentLastVisible);

      const fetchedData = snapshot.docs.map((doc) => ({
        id: String(doc.id),
        source: "firebase",
        ...doc.data(),
      }));
      const newItems = fetchedData.filter(
        (item) => !localSeenIds.has(item.id) && !sessionSeenIds.has(item.id)
      );
      return newItems.length > 0 ? newItems[0] : null;
    } catch (err) {
      console.error("Firebase veri çekme hatası:", err);
      setFirebaseExhausted(true);
      return null;
    }
  }, [lastVisible, firebaseExhausted, sessionSeenIds]);

  const getNextJsonItem = useCallback(() => {
    if (jsonExhausted) return null;
    const localSeenIds = getAndCleanSeenIds(JSON_SEEN_KEY, jsonVideoList);
    const allSeenIds = new Set([...localSeenIds, ...sessionSeenIds]);
    const item = getRandomUnseenJsonVideo(jsonVideoList, allSeenIds);
    if (!item) setJsonExhausted(true);
    return item;
  }, [jsonExhausted, jsonVideoList, sessionSeenIds]);

  const getNextHybridItem = useCallback(async () => {
    const totalRatio = MIX_RATIO.json + MIX_RATIO.firebase;
    const ratioPosition = exploreFeed.length % totalRatio;
    let nextItem = null;

    const isJsonTurn = ratioPosition < MIX_RATIO.json;
    if (isJsonTurn) {
      nextItem = getNextJsonItem();
      if (!nextItem && !firebaseExhausted)
        nextItem = await getNextFirebaseItem();
    } else {
      nextItem = await getNextFirebaseItem();
      if (!nextItem && !jsonExhausted) nextItem = getNextJsonItem();
    }

    if (!nextItem && !firebaseExhausted) nextItem = await getNextFirebaseItem();
    if (!nextItem && !jsonExhausted) nextItem = getNextJsonItem();

    return nextItem;
  }, [
    exploreFeed.length,
    firebaseExhausted,
    jsonExhausted,
    getNextFirebaseItem,
    getNextJsonItem,
  ]);

  useEffect(() => {
    const initialLoad = async () => {
      if (exploreFeed.length > 0 || isFetching) return;
      setState({ loading: true });
      setIsFetching(true);
      const initialItem = await getNextHybridItem();
      if (initialItem) {
        setState({ exploreFeed: [initialItem], currentIndex: 0 });
        markItemAsSeen(
          initialItem.source === "firebase" ? FIREBASE_SEEN_KEY : JSON_SEEN_KEY,
          initialItem.id
        );
      }
      setState({ loading: false });
      setIsFetching(false);
    };
    initialLoad();
  }, [exploreFeed.length, isFetching, getNextHybridItem, setState]);

  const handleNext = useCallback(async () => {
    if (isFetching) return;

    if (currentIndex < exploreFeed.length - 1) {
      setState({ currentIndex: currentIndex + 1 });
      return;
    }

    if (firebaseExhausted && jsonExhausted) return;

    setIsFetching(true);
    const nextItem = await getNextHybridItem();
    setIsFetching(false);

    if (nextItem) {
      setState({
        exploreFeed: [...exploreFeed, nextItem],
        currentIndex: exploreFeed.length,
      });
      markItemAsSeen(
        nextItem.source === "firebase" ? FIREBASE_SEEN_KEY : JSON_SEEN_KEY,
        nextItem.id
      );
    }
  }, [
    currentIndex,
    exploreFeed,
    firebaseExhausted,
    jsonExhausted,
    isFetching,
    getNextHybridItem,
    setState,
  ]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) setState({ currentIndex: currentIndex - 1 });
  }, [currentIndex, setState]);

  const currentItem = exploreFeed[currentIndex] || null;
  const isFirstItem = currentIndex === 0;
  const isLastItemAndExhausted =
    currentIndex === exploreFeed.length - 1 &&
    firebaseExhausted &&
    jsonExhausted;
  const isNextLoading = currentIndex === exploreFeed.length - 1 && isFetching;

  if (loading)
    return (
      <div className={styles.feedWrapper}>
        <p>Karma İçerikler Yükleniyor...</p>
      </div>
    );

  if (!currentItem && firebaseExhausted && jsonExhausted)
    return (
      <div
        className={styles.feedWrapper}
        style={{
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          padding: "20px",
        }}
      >
        <p>Tüm içerikleri gördünüz.</p>
        <button
          onClick={() => {
            localStorage.removeItem(FIREBASE_SEEN_KEY);
            localStorage.removeItem(JSON_SEEN_KEY);
            window.location.reload();
          }}
        >
          Sıfırla ve Yeniden Başlat
        </button>
        <Footer /> {/* ✅ Footer burada da görünecek */}
      </div>
    );

  if (!currentItem)
    return (
      <div className={styles.feedWrapper}>
        <p>İçerik yüklenemedi.</p>
        <Footer /> {/* ✅ Footer burada da görünecek */}
      </div>
    );

  const renderCard = (Component, data) => (
    <Component
      key={data.id}
      data={data}
      onNextPost={handleNext}
      onNext={handleNext}
      onPrevPost={handlePrev}
      onPrev={handlePrev}
      isFirstItem={isFirstItem}
      isLastItem={isLastItemAndExhausted}
      isNextDisabled={isLastItemAndExhausted}
      isNextLoading={isNextLoading}
    />
  );

  return (
    <div className={styles.feedWrapper}>
      {currentItem.source === "firebase" &&
        renderCard(DiscoverVideoCard, currentItem)}
      {currentItem.source === "json" && renderCard(DataDiscover, currentItem)}
      <div className={styles.navButtons}>
        <button
          onClick={handlePrev}
          disabled={isFirstItem}
          className={styles.navButton}
        >
          <FiArrowUp size={32} />
        </button>
        <button
          onClick={handleNext}
          disabled={isLastItemAndExhausted || isNextLoading}
          className={styles.navButton}
        >
          {isNextLoading ? (
            <span style={{ fontSize: "12px" }}>Yükleniyor...</span>
          ) : (
            <FiArrowDown size={32} />
          )}
        </button>
      </div>
      <footer className={styles.footer}>
        <Footer />
      </footer>
    </div>
  );
}
