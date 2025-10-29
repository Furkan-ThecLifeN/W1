import React, { useEffect, useCallback, useRef } from "react";
// 1. ADIM: Firestore'dan 'where' fonksiyonunu import ediyoruz
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  where, // 'where' eklendi
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

import allVideos from "../../data/explore.json";
import allTweets from "../../data/tweets.json";
import allMemes from "../../data/memes.json";
import allPhotos from "../../data/ai-images.json";

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
    // 2. ADIM: Store'dan kullanıcı önbelleğini alıyoruz (yoksa boş obje varsay)
    usersCache = {}, // usersCache eklendi (Zustand store'unuzda olmasa bile varsayılan olarak)
    setState,
  } = useHomeStore();

  const lastPostDocRef = useRef(null);
  const lastFeelingDocRef = useRef(null);

  // =============== Yardımcı Fonksiyonlar (Değişiklik yok) ===============
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

  // =============== Firebase Yükleme (BÜYÜK GÜNCELLEME) ===============
  const loadNextFirebaseBatch = useCallback(async () => {
    if (loading || (postsExhausted && feelingsExhausted)) return;
    setState({ loading: true });

    try {
      // fetchFS yardımcı fonksiyonu (Değişiklik yok)
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
          setState({ [exhaustedKey]: true });
        }
        unseenDocs.forEach((doc) => markAsSeen(seenKey, doc.id));
        return unseenDocs;
      };

      // 1. Önce gönderileri ve hisleri (eski halleriyle) çek
      const posts = await fetchFS(
        collection(db, "globalPosts"),
        lastPostDocRef,
        postsExhausted,
        "postsExhausted",
        "seenFirebasePosts",
        "post"
      );
      const feelings = await fetchFS(
        collection(db, "globalFeelings"),
        lastFeelingDocRef,
        feelingsExhausted,
        "feelingsExhausted",
        "seenFirebaseFeelings",
        "feeling"
      );

      const preliminaryBatch = shuffleArray([...posts, ...feelings]);

      // 2. --- YENİ KULLANICI VERİSİ ÇEKME VE BİRLEŞTİRME ---
      let newBatchWithUsers = [];
      
      if (preliminaryBatch.length > 0) {
        const localUsersCache = { ...usersCache }; // Mevcut önbelleği kopyala
        const uidsToFetch = new Set();

        // Önbellekte olmayan UID'leri bul
        for (const item of preliminaryBatch) {
          if (item.uid && !localUsersCache[item.uid]) {
            uidsToFetch.add(item.uid);
          }
        }

        // Eksik UID'ler için Firestore'dan 'users' koleksiyonunu sorgula
        if (uidsToFetch.size > 0) {
          const uidsArray = Array.from(uidsToFetch);
          
          // Firestore 'in' sorgusu 30 ID ile sınırlıdır, bu yüzden parçalara bölüyoruz
          for (let i = 0; i < uidsArray.length; i += 30) {
            const chunk = uidsArray.slice(i, i + 30);
            
            // Schema'nıza göre 'uid' alanını sorguluyoruz
            const usersQuery = query(collection(db, "users"), where("uid", "in", chunk)); 
            const usersSnap = await getDocs(usersQuery);

            usersSnap.forEach(userDoc => {
              const userData = userDoc.data();
              // Gelen veriyi UID'sini anahtar olarak kullanarak önbelleğe ekle
              if(userData.uid) {
                localUsersCache[userData.uid] = userData;
              }
            });
          }
          // Global (Zustand) store'daki önbelleği güncelle
          setState({ usersCache: localUsersCache });
        }

        // 3. Gönderi verisi ile GÜNCEL kullanıcı verisini birleştir
        newBatchWithUsers = preliminaryBatch.map(item => {
          const freshUserData = localUsersCache[item.uid];
          if (freshUserData) {
            // Eski 'displayName' ve 'photoURL' yerine yenilerini yaz
            return {
              ...item,
              displayName: freshUserData.displayName, 
              photoURL: freshUserData.photoURL,
              username: freshUserData.username, // Profil linkleri için username'i de alalım
            };
          }
          return item; // Eşleşen kullanıcı bulunamazsa orijinal veriyi döndür
        });
      }
      // --- YENİ KULLANICI VERİSİ ÇEKME SONU ---


      setState({
        // 4. Güncellenmiş veriyi feed'e ekle
        firebaseFeed: [...firebaseFeed, ...newBatchWithUsers],
        initialLoadDone: { ...initialLoadDone, firebase: true },
      });

    } catch (err) {
      console.error("Firebase batch yükleme hatası:", err);
    } finally {
      setState({ loading: false });
    }
    // 5. ADIM: 'usersCache'i useCallback dependency array'ine ekle
  }, [loading, postsExhausted, feelingsExhausted, firebaseFeed, initialLoadDone, setState, usersCache]);

  // =============== JSON Yükleme (Değişiklik yok) ===============
  const loadNextJsonBatch = useCallback(async () => {
    if (loading || jsonExhausted) return;
    setState({ loading: true });

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
        selected.push({
          ...item,
          id: item.id.toString(),
          type: typeOverride || (seenKey === "seenMemes" ? "image" : seenKey === "seenVideos" ? "video" : "quote"),
          source: "json",
        });
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
      set.push(...pickRandomly(allPhotos, 2, "seenPhotos", "photo"));
      newBatch.push(...shuffleArray(set));
    }

    if (newBatch.length < JSON_BATCH_SIZE) setState({ jsonExhausted: true });
    setState({
      jsonFeed: [...jsonFeed, ...newBatch],
      initialLoadDone: { ...initialLoadDone, json: true },
      loading: false,
    });
  }, [loading, jsonExhausted, jsonFeed, initialLoadDone, setState]);

  // =============== useEffect’ler (Değişiklik yok) ===============
  useEffect(() => {
    if (!initialLoadDone.json) loadNextJsonBatch();
  }, [loadNextJsonBatch, initialLoadDone.json]);

  useEffect(() => {
    if (activeView === "firebase" && !initialLoadDone.firebase) {
      loadNextFirebaseBatch();
    }
  }, [activeView, initialLoadDone.firebase, loadNextFirebaseBatch]);

  // =============== Görünüm (Değişiklik yok) ===============
  const currentFeed = activeView === "firebase" ? firebaseFeed : jsonFeed;
  const isExhausted =
    activeView === "firebase"
      ? postsExhausted && feelingsExhausted
      : jsonExhausted;
  const loadMore =
    activeView === "firebase" ? loadNextFirebaseBatch : loadNextJsonBatch;

  const renderItem = (item) => {
    const uniqueKey = `${item.source}-${item.type}-${item.id}`;
    if (activeView === "json" && item.type === "photo")
      return <PhotoCard key={uniqueKey} photo={item} />;
    switch (item.type) {
      case "video":
        return <VideoPostCard key={uniqueKey} data={item} />;
      case "quote":
        return <QuoteCard key={uniqueKey} data={item} />;
      case "post":
        // PostCard artık güncel {displayName, photoURL, username} alacak
        return <PostCard key={uniqueKey} data={item} />;
      case "feeling":
         // TweetCard artık güncel {displayName, photoURL, username} alacak
        return <TweetCard key={uniqueKey} data={item} />;
      case "image":
        return <MemePostCard key={uniqueKey} meme={item} />;
      default:
        return null;
    }
  };

  const showLoadingOverlay = loading && currentFeed.length === 0;

  // =============== Render (Değişiklik yok) ===============
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