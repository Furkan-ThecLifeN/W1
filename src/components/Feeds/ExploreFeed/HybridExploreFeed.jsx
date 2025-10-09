import React, { useState, useEffect, useCallback } from "react";
// ✅ Firebase backend bağlantıları
import { db } from "../../../config/firebase-client";
import {
    collection,
    query,
    orderBy,
    limit,
    getDocs,
    startAfter,
} from "firebase/firestore";
// Yeni DiscoverVideoCard bileşenini içe aktar
import DiscoverVideoCard from "../DiscoverVideoCard/DiscoverVideoCard";
import styles from "./HybridExploreFeed.module.css";
import { FiArrowDown, FiArrowUp } from "react-icons/fi";

// ==========================================================
// LOCAL STORAGE YARDIMCI FONKSİYONLARI (DEĞİŞMEDİ)
// ==========================================================

// 2 hafta (14 gün) milisaniye cinsinden
const SEEN_EXPIRATION_MS = 14 * 24 * 60 * 60 * 1000;
const STORAGE_KEY = "seenPostIds";

/**
 * LocalStorage'dan görülen post ID'lerini okur ve süresi dolanları temizler.
 * @returns {Set<string>} Süresi dolmamış görülen post ID'leri.
 */
const getSeenPostIds = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return new Set();

        const seenPosts = JSON.parse(stored);
        const now = Date.now();
        const freshPosts = {};

        // Süresi dolanları filtrele
        for (const [id, expiry] of Object.entries(seenPosts)) {
            if (expiry > now) {
                freshPosts[id] = expiry;
            }
        }

        // Temizlenmiş listeyi geri kaydet
        localStorage.setItem(STORAGE_KEY, JSON.stringify(freshPosts));

        return new Set(Object.keys(freshPosts));
    } catch (e) {
        console.error("LocalStorage okuma/temizleme hatası:", e);
        return new Set();
    }
};

/**
 * Belirtilen post ID'sini geçerli bir süre ile görülenlere ekler.
 * @param {string} postId Görüldü olarak işaretlenecek postun ID'si.
 */
const markPostAsSeen = (postId) => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const seenPosts = stored ? JSON.parse(stored) : {};
        const now = Date.now();
        
        // Yeni bitiş zamanını hesapla (şimdi + 2 hafta)
        seenPosts[postId] = now + SEEN_EXPIRATION_MS;

        localStorage.setItem(STORAGE_KEY, JSON.stringify(seenPosts));
    } catch (e) {
        console.error("LocalStorage yazma hatası:", e);
    }
};

// ==========================================================
// REACT BİLEŞENİ
// ==========================================================

export default function HybridExploreFeed() {
    const [feed, setFeed] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    // lastVisible: null (başlangıçta), undefined (tüm veriler çekildi), DocumentSnapshot (çekilecek bir sonraki sayfa)
    const [lastVisible, setLastVisible] = useState(null); 
    const FIREBASE_BATCH = 5;

    // Firebase verilerini çekme fonksiyonu (useCallback ile optimize edildi)
    const fetchFirebaseData = useCallback(async (initialLoad = false) => {
        // Zaten veri çekiliyorsa veya tüm veriler çekilmişse çık
        if (isFetchingMore || (!initialLoad && lastVisible === undefined)) {
            if (lastVisible === undefined) {
                // Bu logu kaldırarak gereksiz tekrarı önleyebiliriz
                // console.log("Tüm içerikler zaten yüklendi.");
            }
            return;
        }

        setIsFetchingMore(true);
        if (initialLoad) setLoading(true);

        try {
            const seenIds = getSeenPostIds(); 
            let newFeedItems = [];
            let currentLastVisible = lastVisible; // Döngü boyunca güncellediğimiz geçici DocumentSnapshot
            let shouldContinueFetching = true;
            let totalFetchAttempts = 0; // Çok fazla boş istek atmamak için say
            let nextQueryStartDoc = currentLastVisible; // Bir sonraki sorgunun başlangıç noktası

            // ⭐️ Düzeltme: Yeni, görülmemiş içerik bulana kadar döngü yap (max 4 deneme)
            while (newFeedItems.length < FIREBASE_BATCH && shouldContinueFetching && totalFetchAttempts < 4) {
                totalFetchAttempts++;
                const feedsCollection = collection(db, "globalFeeds");
                let q;

                // Pagination sorgusu oluştur
                if (nextQueryStartDoc && nextQueryStartDoc !== true) {
                    q = query(
                        feedsCollection,
                        orderBy("createdAt", "desc"),
                        startAfter(nextQueryStartDoc),
                        limit(FIREBASE_BATCH)
                    );
                } else {
                    q = query(
                        feedsCollection,
                        orderBy("createdAt", "desc"),
                        limit(FIREBASE_BATCH)
                    );
                }

                const snapshot = await getDocs(q);

                // Veri yoksa (Veritabanının sonuna ulaşıldı)
                if (snapshot.empty) {
                    console.log("Firebase'den çekilecek daha fazla içerik yok. (Döngü Bitti)");
                    shouldContinueFetching = false;
                    currentLastVisible = undefined; // Sonsuz döngüden çıkmak için kesin olarak undefined yap
                    break;
                }

                // Bir sonraki sorgu için son dökümanı güncelle (Bu, bir sonraki batch'in başlangıç noktası olacak)
                nextQueryStartDoc = snapshot.docs[snapshot.docs.length - 1]; 
                
                const fetchedData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    type: "video",
                    ...doc.data(),
                }));

                // Görülen postları filtrele
                const filteredData = fetchedData.filter(item => !seenIds.has(item.id));
                newFeedItems = [...newFeedItems, ...filteredData];

                // Eğer çekilen batch tam FIREBASE_BATCH'ten az ise son sayfadayız demektir.
                if (snapshot.docs.length < FIREBASE_BATCH) {
                    shouldContinueFetching = false;
                    currentLastVisible = undefined; // Sonsuz döngüden çıkmak için kesin olarak undefined yap
                    break;
                } 
                
                // Yeterli yeni içeriği bulduk.
                if (newFeedItems.length >= FIREBASE_BATCH) {
                    // Bulduk, bir sonraki query için nextQueryStartDoc geçerli DocumentSnapshot'ı tutuyor.
                    currentLastVisible = nextQueryStartDoc;
                    break;
                }
                
                // Eğer yeterli içerik bulamadıysak (newFeedItems.length < FIREBASE_BATCH) ve döngü limitine ulaşmadıysak
                // döngü devam edecek ve bir sonraki sorgu için nextQueryStartDoc kullanılacak.
            }
            
            // ⭐️ Düzeltme: lastVisible durumunu döngü bittikten sonra bir kez güncelle
            // Sonsuz döngülerin asıl nedeni budur.
            setLastVisible(currentLastVisible);

            // Eğer yeni içerik bulunduysa feed'e ekle
            if (newFeedItems.length > 0) {
                // Sadece ilk FIREBASE_BATCH kadarını al 
                const itemsToAdd = newFeedItems.slice(0, FIREBASE_BATCH);
                setFeed((prev) => [...prev, ...itemsToAdd]);
                console.log(`Firebase'den ${itemsToAdd.length} yeni (görülmemiş) veri başarıyla çekildi.`);
            } else if (currentLastVisible === undefined) {
                 // Eğer içerik bulunamadıysa (newFeedItems.length === 0) ve lastVisible artık undefined ise, 
                 // tüm verilerin çekildiği anlamına gelir. Bu durumda log yazılabilir.
                 console.log("Listenin sonu. Çekilecek yeni görülmemiş içerik yok.");
            }


        } catch (error) {
            console.error("Firebase veri çekme hatası:", error);
        } finally {
            if (initialLoad) setLoading(false);
            setIsFetchingMore(false);
        }
    }, [isFetchingMore, lastVisible]); // feed.length'i bağımlılıktan kaldırdım, activeIndex yeterli

    // 1️⃣ İlk yükleme: useEffect içinde Firebase verilerini çek
    useEffect(() => {
        // lastVisible undefined ise (tüm içerik yüklendiyse) ilk yüklemeyi tekrar deneme
        if (lastVisible === undefined) return; 
        
        fetchFirebaseData(true);
    }, [fetchFirebaseData, lastVisible]); // lastVisible durumunu da kontrol et

    // 2️⃣ Sonraki İçeriğe Gitme Fonksiyonu (DEĞİŞMEDİ)
    const handleNext = useCallback(() => {
        // Mevcut postu görüldü olarak işaretle
        if (feed[activeIndex]) {
            markPostAsSeen(feed[activeIndex].id);
        }

        if (activeIndex < feed.length - 1) {
            // Listenin içinde bir sonraki elemana geç
            setActiveIndex(activeIndex + 1);
        } else if (lastVisible !== undefined && !isFetchingMore) {
             // ⭐️ Listenin sonuna gelindi VE daha fazla veri ÇEKİLEBİLİR.
             // Butona basıldığında yeni veri çekmeyi tetikle.
            fetchFirebaseData(); 
            
        } else if (activeIndex === feed.length - 1 && lastVisible === undefined) {
            // Listenin sonuna gelindi ve çekilecek daha fazla veri yok.
            console.log("Listenin sonu, daha fazla içerik yok.");
        }
    }, [activeIndex, feed, fetchFirebaseData, lastVisible, isFetchingMore]);

    // 3️⃣ Önceki İçeriğe Gitme Fonksiyonu (DEĞİŞMEDİ)
    const handlePrev = useCallback(() => {
        // Geri giderken de mevcut postu görüldü olarak işaretle
        if (feed[activeIndex]) {
            markPostAsSeen(feed[activeIndex].id);
        }
        
        if (activeIndex > 0) setActiveIndex(activeIndex - 1);
    }, [activeIndex, feed]);

    // Yükleniyor ve Boş İçerik Durumları 
    if (loading)
        return (
            <div className={styles.feedWrapper}>
                <p>İçerikler Yükleniyor...</p>
            </div>
        ); 
        
    if (feed.length === 0)
        return (
            <div className={styles.feedWrapper} style={{justifyContent: 'center', alignItems: 'center'}}>
                <p>Henüz içerik yok veya tüm içerikler görüldü.</p>
                <button 
                    onClick={() => {
                        // Tamamen sıfırlayıp tekrar dene
                        setFeed([]);
                        setActiveIndex(0);
                        setLastVisible(null); 
                        fetchFirebaseData(true);
                    }} 
                    disabled={isFetchingMore}
                    style={{padding: '10px 20px', cursor: 'pointer', background: '#00aaff', color: 'white', border: 'none', borderRadius: '8px'}}
                >
                    {isFetchingMore ? "Yükleniyor..." : "Tekrar Dene"}
                </button>
            </div>
        );

    const currentItem = feed[activeIndex];

    // Durum değişkenleri DiscoverVideoCard için hazırlanır
    const isFirstItem = activeIndex === 0;
    // lastVisible === undefined demek, Firebase'den çekilebilecek tüm verinin çekildiği anlamına gelir.
    const isLastItem = activeIndex === feed.length - 1 && lastVisible === undefined;

    return (
        <div className={styles.feedWrapper}>
            {/* Tek Video Player yerine yeni bileşen kullanıldı */}
            {currentItem && (
                // ⭐️ DiscoverVideoCard'a navigasyon handler'ları ve durumları geçirildi
                <DiscoverVideoCard 
                    key={currentItem.id} 
                    data={currentItem} 
                    onNextPost={handleNext} 
                    onPrevPost={handlePrev} 
                    isFirstItem={isFirstItem}
                    isLastItem={isLastItem}
                />
            )}
            
            {/* Navigasyon Butonları (Mobile de gözüken) */}
            <div className={styles.navButtons}>
                <button
                    onClick={handlePrev}
                    disabled={isFirstItem} // İlk elemansa devre dışı
                    className={styles.navButton}
                    aria-label="Önceki İçerik"
                >
                    <FiArrowUp size={32} />
                </button>
                <button
                    onClick={handleNext}
                    // Son elemandaysak ve çekilecek başka veri yoksa devre dışı.
                    disabled={activeIndex === feed.length - 1 && lastVisible === undefined} 
                    className={styles.navButton}
                    aria-label="Sonraki İçerik"
                >
                    {activeIndex === feed.length - 1 && isFetchingMore ? (
                        <span style={{ fontSize: '12px' }}>Yükleniyor...</span>
                    ) : (
                        <FiArrowDown size={32} />
                    )}
                </button>
            </div>
        </div>
    );
}