import React, { useState, useEffect, useCallback, useMemo } from "react";
// ✅ Firebase bağlantıları
import { db } from "../../../config/firebase-client";
import {
    collection,
    query,
    orderBy,
    limit,
    getDocs,
    startAfter,
} from "firebase/firestore";

// ✅ Kart Bileşenleri
import DiscoverVideoCard from "../DiscoverVideoCard/DiscoverVideoCard"; // Firebase için
import DataDiscover from "../../data-discover/DataDiscover"; // JSON için

// ✅ JSON verisi importu
import allVideos from '../../../data/explore.json'; 

import styles from "./HybridExploreFeed.module.css";
import { FiArrowDown, FiArrowUp } from "react-icons/fi";

// ==========================================================
// SABİTLER ve KARMA YAPI AYARLARI
// ==========================================================
const EXPIRATION_DURATION = 14 * 24 * 60 * 60 * 1000; // 14 gün (2 hafta)
const FIREBASE_SEEN_KEY = "seenPostIds_fb";
const JSON_SEEN_KEY = "seenPostIds_json";
const FIREBASE_BATCH_SIZE = 5; // Firebase'den her seferinde çekilecek post sayısı

// ✅ KULLANICI İÇİN KOLAY AYARLANABİLİR KARMA ORANI
// Örn: 5 JSON postu göster, sonra 1 Firebase postu göster.
const MIX_RATIO = {
    json: 5,
    firebase: 1
};

// ==========================================================
// LOCAL STORAGE YARDIMCI FONKSİYONLARI (Birleştirilmiş ve Geliştirilmiş)
// ==========================================================

const getAndCleanSeenIds = (storageKey, sourceList = null) => {
    try {
        const stored = localStorage.getItem(storageKey);
        if (!stored) return new Set();

        let seenPosts = JSON.parse(stored);
        const now = Date.now();
        const freshPosts = {};
        
        const validIds = sourceList ? new Set(sourceList.map(item => String(item.id))) : null;

        for (const id in seenPosts) {
            const timestamp = seenPosts[id];
            const isFresh = now - timestamp < EXPIRATION_DURATION;
            const isValid = !validIds || validIds.has(String(id)); 

            if (isFresh && isValid) {
                freshPosts[id] = timestamp;
            }
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
    const unseenVideos = videoList.filter(video => 
        !allSeenIds.has(String(video.id))
    );
    if (unseenVideos.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * unseenVideos.length);
    return { ...unseenVideos[randomIndex], id: String(unseenVideos[randomIndex].id), source: 'json' }; 
};

// ==========================================================
// REACT BİLEŞENİ
// ==========================================================

export default function HybridExploreFeed() {
    // 📌 Ana Akış Durumları
    const [history, setHistory] = useState([]); 
    const [currentIndex, setCurrentIndex] = useState(0); 
    const [loading, setLoading] = useState(true);
    const [isFetching, setIsFetching] = useState(false); 

    // 📌 Firebase ve JSON Kaynak Durumları
    const [lastVisible, setLastVisible] = useState(null); 
    const [firebaseExhausted, setFirebaseExhausted] = useState(false); 
    const [jsonExhausted, setJsonExhausted] = useState(false); 

    // 📌 Veri Kaynakları
    const jsonVideoList = useMemo(() => allVideos, []);

    // 📌 Mevcut oturumda gösterilmiş tüm ID'lerin setini hesapla
    const sessionSeenIds = useMemo(() => new Set(history.map(item => String(item.id))), [history]);

    // ==========================================================
    // HYBRID VERİ ÇEKME FONKSİYONLARI
    // ==========================================================
    
    // ✅ Firebase'den yeni bir parti görülmemiş veri çekmeye çalışır.
    const getNextFirebaseItem = useCallback(async () => {
        if (firebaseExhausted || lastVisible === undefined) return null;

        try {
            const localSeenIds = getAndCleanSeenIds(FIREBASE_SEEN_KEY); 
            let newItems = [];
            let currentLastVisible = lastVisible; 
            let totalFetchAttempts = 0;

            while (newItems.length === 0 && totalFetchAttempts < 5) {
                totalFetchAttempts++;
                const feedsCollection = collection(db, "globalFeeds");
                let q;
                
                if (currentLastVisible && currentLastVisible !== true) {
                    q = query(
                        feedsCollection,
                        orderBy("createdAt", "desc"),
                        startAfter(currentLastVisible),
                        limit(FIREBASE_BATCH_SIZE)
                    );
                } else {
                    q = query(
                        feedsCollection,
                        orderBy("createdAt", "desc"),
                        limit(FIREBASE_BATCH_SIZE)
                    );
                }

                const snapshot = await getDocs(q);
                if (snapshot.empty) {
                    setFirebaseExhausted(true);
                    setLastVisible(undefined);
                    return null;
                }
                currentLastVisible = snapshot.docs[snapshot.docs.length - 1]; 
                const fetchedData = snapshot.docs.map((doc) => ({ id: String(doc.id), source: "firebase", ...doc.data() }));
                newItems = fetchedData.filter(item => 
                    !localSeenIds.has(item.id) && !sessionSeenIds.has(item.id)
                );
                if (snapshot.docs.length < FIREBASE_BATCH_SIZE) {
                     setLastVisible(undefined);
                } else {
                     setLastVisible(currentLastVisible);
                }
            }
            if (newItems.length > 0) return newItems[0];
            return null;

        } catch (error) {
            console.error("Firebase veri çekme hatası:", error);
            setFirebaseExhausted(true);
            return null;
        }
    }, [lastVisible, firebaseExhausted, sessionSeenIds]);
    
    // ✅ JSON'dan rastgele bir görülmemiş öğe seçer.
    const getNextJsonItem = useCallback(() => {
        if (jsonExhausted) return null;
        const localSeenIds = getAndCleanSeenIds(JSON_SEEN_KEY, jsonVideoList);
        const allSeenIds = new Set([...localSeenIds, ...sessionSeenIds]);
        const item = getRandomUnseenJsonVideo(jsonVideoList, allSeenIds);
        if (item) return item;
        setJsonExhausted(true);
        return null;
    }, [jsonExhausted, jsonVideoList, sessionSeenIds]);

    
    /**
     * ✅ Hibrid mantıkla sıradaki tek bir öğeyi (Firebase veya JSON) getirir.
     * Bu fonksiyon, ayarlanmış karıştırma oranını (MIX_RATIO) kullanır.
     * @returns {Promise<object|null>} Bir sonraki öğe veya null.
     */
    const getNextHybridItem = useCallback(async () => {
        const totalRatio = MIX_RATIO.json + MIX_RATIO.firebase;
        const ratioPosition = history.length % totalRatio;

        let nextItem = null;
        const isJsonTurn = ratioPosition < MIX_RATIO.json; 
        
        // 1. Belirlenen sıraya göre deneme
        if (isJsonTurn) {
            nextItem = getNextJsonItem();
            if (!nextItem && !firebaseExhausted) { // JSON bittiyse, diğer kaynağı dene
                 nextItem = await getNextFirebaseItem();
            }
        } else { // Firebase sırası
            nextItem = await getNextFirebaseItem();
            if (!nextItem && !jsonExhausted) { // Firebase bittiyse, diğer kaynağı dene
                 nextItem = getNextJsonItem();
            }
        }
        
        // 2. Eğer ilk denemede bir şey bulunamadıysa (örneğin kaynaklardan biri bittiği için)
        // Kalan diğer kaynağı zorla dene
        if (!nextItem && !firebaseExhausted) {
             nextItem = await getNextFirebaseItem();
        }
        if (!nextItem && !jsonExhausted) {
            nextItem = getNextJsonItem();
        }
        
        return nextItem; 
    }, [history.length, firebaseExhausted, jsonExhausted, getNextFirebaseItem, getNextJsonItem]);


    // ==========================================================
    // EFEKTLER VE NAVİGASYON
    // ==========================================================

    useEffect(() => {
        const initialLoad = async () => {
            if (history.length > 0 || isFetching) return; 
            setLoading(true);
            setIsFetching(true);
            const initialItem = await getNextHybridItem(); 
            if (initialItem) {
                setHistory([initialItem]);
                setCurrentIndex(0);
                markItemAsSeen(
                    initialItem.source === 'firebase' ? FIREBASE_SEEN_KEY : JSON_SEEN_KEY,
                    initialItem.id
                );
            } else {
                 console.log("Başlangıçta yüklenecek içerik bulunamadı.");
            }
            setLoading(false);
            setIsFetching(false);
        };
        initialLoad();
    }, []);

    const handleNext = useCallback(async () => {
        if (isFetching) return;
        if (currentIndex < history.length - 1) {
            setCurrentIndex(prev => prev + 1);
            return;
        }
        if (firebaseExhausted && jsonExhausted) {
            console.log("Tüm içerikler tükendi.");
            return;
        }
        setIsFetching(true);
        const nextItem = await getNextHybridItem();
        setIsFetching(false);
        if (nextItem) {
            setHistory(prev => [...prev, nextItem]);
            setCurrentIndex(prev => prev + 1);
            markItemAsSeen(
                nextItem.source === 'firebase' ? FIREBASE_SEEN_KEY : JSON_SEEN_KEY,
                nextItem.id
            );
        } else {
            console.log("Daha fazla yeni içerik bulunamadı.");
        }
    }, [currentIndex, history.length, firebaseExhausted, jsonExhausted, getNextHybridItem, isFetching]);

    const handlePrev = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    }, [currentIndex]);
    
    // 📌 Render Edilecek Veri
    const currentItem = history[currentIndex] || null;

    // ==========================================================
    // RENDER VE KART SEÇİMİ
    // ==========================================================

    const isFirstItem = currentIndex === 0;
    const isLastItemAndExhausted = currentIndex === history.length - 1 && firebaseExhausted && jsonExhausted;
    const isNextLoading = currentIndex === history.length - 1 && isFetching;

    if (loading)
        return (
            <div className={styles.feedWrapper}>
                <p>Karma İçerikler Yükleniyor...</p>
            </div>
        ); 
        
    if (!currentItem && (firebaseExhausted && jsonExhausted))
        return (
            <div className={styles.feedWrapper} style={{justifyContent: 'center', alignItems: 'center', height: '100vh', padding: '20px'}}>
                <p>Tebrikler! Şu an için gösterilebilecek **tüm** içerikleri gördünüz.</p>
                <button 
                    onClick={() => {
                        localStorage.removeItem(FIREBASE_SEEN_KEY);
                        localStorage.removeItem(JSON_SEEN_KEY);
                        window.location.reload(); 
                    }} 
                    style={{marginTop: '20px', padding: '10px 20px', cursor: 'pointer', background: '#ff0000', color: 'white', border: 'none', borderRadius: '8px'}}
                >
                    Tüm Görülenleri Sıfırla ve Yeniden Başlat
                </button>
            </div>
        );

    if (!currentItem) return <div className={styles.feedWrapper}><p>İçerik yüklenemedi.</p></div>;
    
    // ✅ Kart Seçimi: Gelen verinin kaynağına göre doğru bileşeni çağır
    
    const renderCard = (Component, data) => (
        <Component 
            key={data.id} 
            data={data} 
            // DiscoverVideoCard ve DataDiscover için ortak proplar
            onNextPost={handleNext} // DiscoverVideoCard için
            onNext={handleNext}    // DataDiscover için
            onPrevPost={handlePrev} // DiscoverVideoCard için
            onPrev={handlePrev}    // DataDiscover için
            isFirstItem={isFirstItem}
            isLastItem={isLastItemAndExhausted}
            isNextDisabled={isLastItemAndExhausted}
            isNextLoading={isNextLoading}
        />
    );
    
    return (
        <div className={styles.feedWrapper}>
            {currentItem.source === 'firebase' && renderCard(DiscoverVideoCard, currentItem)}
            {currentItem.source === 'json' && renderCard(DataDiscover, currentItem)}
            
            {/* Navigasyon Butonları (Mobile de gözüken) */}
            <div className={styles.navButtons}>
                <button
                    onClick={handlePrev}
                    disabled={isFirstItem} 
                    className={styles.navButton}
                    aria-label="Önceki İçerik"
                >
                    <FiArrowUp size={32} />
                </button>
                <button
                    onClick={handleNext}
                    disabled={isLastItemAndExhausted || isNextLoading} 
                    className={styles.navButton}
                    aria-label="Sonraki İçerik"
                >
                    {isNextLoading ? (
                        <span style={{ fontSize: '12px' }}>Yükleniyor...</span>
                    ) : (
                        <FiArrowDown size={32} />
                    )}
                </button>
            </div>
        </div>
    );
}