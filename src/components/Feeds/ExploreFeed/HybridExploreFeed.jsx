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
// SABİTLER
// ==========================================================
const EXPIRATION_DURATION = 14 * 24 * 60 * 60 * 1000; // 14 gün (2 hafta)
const FIREBASE_SEEN_KEY = "seenPostIds_fb";
const JSON_SEEN_KEY = "seenPostIds_json";
const FIREBASE_BATCH_SIZE = 5; // Firebase'den her seferinde çekilecek post sayısı

// ==========================================================
// LOCAL STORAGE YARDIMCI FONKSİYONLARI (Birleştirilmiş ve Geliştirilmiş)
// ==========================================================

/**
 * LocalStorage'dan görülen ID'leri okur, süresi dolanları ve geçersiz ID'leri temizler.
 * @param {string} storageKey Hangi kaynağın (Firebase/JSON) ID'leri çekilecek.
 * @param {Array<object>} [sourceList=null] JSON kaynağında sadece geçerli ID'leri tutmak için.
 * @returns {Set<string>} Süresi dolmamış ve geçerli görülen ID'ler.
 */
const getAndCleanSeenIds = (storageKey, sourceList = null) => {
    try {
        const stored = localStorage.getItem(storageKey);
        if (!stored) return new Set();

        let seenPosts = JSON.parse(stored);
        const now = Date.now();
        const freshPosts = {};
        
        // Sadece JSON kaynağı için geçerli ID setini oluştur
        const validIds = sourceList ? new Set(sourceList.map(item => String(item.id))) : null;

        for (const id in seenPosts) {
            const timestamp = seenPosts[id];
            const isFresh = now - timestamp < EXPIRATION_DURATION;
            // JSON ise, ID'nin hala JSON listesinde var olup olmadığını kontrol et
            const isValid = !validIds || validIds.has(String(id)); 

            if (isFresh && isValid) {
                freshPosts[id] = timestamp;
            }
        }

        localStorage.setItem(storageKey, JSON.stringify(freshPosts));
        // Her zaman string set olarak döndür (Firebase/JSON ID'lerini birleştirmeyi kolaylaştırır)
        return new Set(Object.keys(freshPosts).map(String)); 
    } catch (e) {
        console.error(`Local storage (${storageKey}) okuma/temizleme hatası:`, e);
        return new Set();
    }
};

/**
 * Belirtilen öğe ID'sini görüldü olarak işaretler.
 * @param {string} storageKey Hangi kaynağın ID'si işaretlenecek.
 * @param {string|number} itemId Görüldü olarak işaretlenecek öğenin ID'si.
 */
const markItemAsSeen = (storageKey, itemId) => {
    try {
        const stored = localStorage.getItem(storageKey);
        const seenPosts = stored ? JSON.parse(stored) : {};
        
        // Yeni videonun ID'sini ve güncel zaman damgasını ekle/güncelle
        seenPosts[String(itemId)] = Date.now(); 

        localStorage.setItem(storageKey, JSON.stringify(seenPosts));
    } catch (e) {
        console.error(`Local storage (${storageKey}) yazma hatası:`, e);
    }
};

// ==========================================================
// RANDOM SEÇİM YARDIMCISI (JSON İÇİN)
// ==========================================================

/**
 * Görülmemiş JSON videosunu seçer.
 * @param {Array<object>} videoList Tüm JSON videoları.
 * @param {Set<string>} allSeenIds LocalStorage ve mevcut oturumda görülen tüm ID'ler.
 * @returns {object|null} Görülmemiş rastgele video nesnesi veya null.
 */
const getRandomUnseenJsonVideo = (videoList, allSeenIds) => {
    // Görülmemiş videoları filtrele
    const unseenVideos = videoList.filter(video => 
        !allSeenIds.has(String(video.id))
    );

    if (unseenVideos.length === 0) {
        return null;
    }

    const randomIndex = Math.floor(Math.random() * unseenVideos.length);
    // Kaynak bilgisini ekle, ID'yi string yap
    return { ...unseenVideos[randomIndex], id: String(unseenVideos[randomIndex].id), source: 'json' }; 
};


// ==========================================================
// REACT BİLEŞENİ
// ==========================================================

export default function HybridExploreFeed() {
    // 📌 Ana Akış Durumları
    const [history, setHistory] = useState([]); // Görüntülenen tüm öğelerin ordered listesi (Session History)
    const [currentIndex, setCurrentIndex] = useState(0); // Şu anki pozisyon
    const [loading, setLoading] = useState(true);
    const [isFetching, setIsFetching] = useState(false); // Yeni veri çekme durumu

    // 📌 Firebase ve JSON Kaynak Durumları
    const [lastVisible, setLastVisible] = useState(null); // Firebase pagination referansı (null: başlangıç, undefined: bitti)
    const [firebaseExhausted, setFirebaseExhausted] = useState(false); // Firebase'de görülmemiş içerik bitti mi?
    const [jsonExhausted, setJsonExhausted] = useState(false); // JSON'da görülmemiş içerik bitti mi?

    // 📌 Veri Kaynakları
    const jsonVideoList = useMemo(() => allVideos, []);

    // 📌 Mevcut oturumda zaten gösterilmiş olan tüm ID'lerin setini hesapla
    const sessionSeenIds = useMemo(() => new Set(history.map(item => String(item.id))), [history]);

    // ==========================================================
    // HYBRID VERİ ÇEKME FONKSİYONLARI
    // ==========================================================
    
    /**
     * Firebase'den yeni bir parti görülmemiş veri çekmeye çalışır.
     */
    const getNextFirebaseItem = useCallback(async () => {
        if (firebaseExhausted || lastVisible === undefined) return null;

        try {
            const localSeenIds = getAndCleanSeenIds(FIREBASE_SEEN_KEY); 
            let newItems = [];
            let currentLastVisible = lastVisible; 
            let totalFetchAttempts = 0;

            // Görülmemiş postları bulana kadar sayfalamaya devam et (max 5 deneme)
            while (newItems.length === 0 && totalFetchAttempts < 5) {
                totalFetchAttempts++;
                
                const feedsCollection = collection(db, "globalFeeds");
                let q;
                
                // Pagination sorgusu oluştur
                if (currentLastVisible && currentLastVisible !== true) {
                    q = query(
                        feedsCollection,
                        orderBy("createdAt", "desc"),
                        startAfter(currentLastVisible),
                        limit(FIREBASE_BATCH_SIZE)
                    );
                } else { // İlk yükleme veya bir önceki sorgu bittiğinde (lastVisible = null/true)
                    q = query(
                        feedsCollection,
                        orderBy("createdAt", "desc"),
                        limit(FIREBASE_BATCH_SIZE)
                    );
                }

                const snapshot = await getDocs(q);

                // Veri yoksa (Veritabanının sonuna ulaşıldı)
                if (snapshot.empty) {
                    setFirebaseExhausted(true);
                    setLastVisible(undefined);
                    return null;
                }

                // Bir sonraki sorgu için son dökümanı güncelle
                currentLastVisible = snapshot.docs[snapshot.docs.length - 1]; 
                
                const fetchedData = snapshot.docs.map((doc) => ({
                    id: String(doc.id), 
                    source: "firebase", 
                    ...doc.data(),
                }));

                // LocalStorage'da veya mevcut oturumda görülmemiş postları filtrele
                newItems = fetchedData.filter(item => 
                    !localSeenIds.has(item.id) && !sessionSeenIds.has(item.id)
                );
                
                // Eğer çekilen batch tam FIREBASE_BATCH_SIZE'dan az ise son sayfadayız demektir.
                if (snapshot.docs.length < FIREBASE_BATCH_SIZE) {
                     // Firebase tükendi, nextLastVisible undefined olacak
                     setLastVisible(undefined);
                } else {
                     // Bir sonraki sorgu için yeni döküman referansını kaydet
                     setLastVisible(currentLastVisible);
                }
            }
            
            // Eğer newItems.length > 0 ise, ilkini döndür (kalabalık yapmamak için)
            if (newItems.length > 0) {
                 return newItems[0];
            } else {
                 // 5 denemeye rağmen yeni item bulunamadıysa (hepsi görülmüş), bitti olarak işaretlemiyoruz,
                 // ancak bir sonraki denemeye kadar ilerliyoruz.
                 // Eğer son sayfadaysak zaten setLastVisible(undefined) çağrıldı.
                 return null;
            }


        } catch (error) {
            console.error("Firebase veri çekme hatası:", error);
            setFirebaseExhausted(true);
            return null;
        }
    }, [lastVisible, firebaseExhausted, sessionSeenIds]);
    
    /**
     * JSON'dan rastgele bir görülmemiş öğe seçer.
     * @returns {object|null} Seçilen öğe veya null.
     */
    const getNextJsonItem = useCallback(() => {
        if (jsonExhausted) return null;
        
        const localSeenIds = getAndCleanSeenIds(JSON_SEEN_KEY, jsonVideoList);
        
        // JSON videosunu seçmek için LocalStorage ve mevcut oturumdaki tüm görülen ID'leri kullan
        const allSeenIds = new Set([...localSeenIds, ...sessionSeenIds]);
        
        const item = getRandomUnseenJsonVideo(jsonVideoList, allSeenIds);

        if (item) {
            return item;
        } else {
            setJsonExhausted(true);
            return null;
        }
    }, [jsonExhausted, jsonVideoList, sessionSeenIds]);

    
    /**
     * Hibrid mantıkla sıradaki tek bir öğeyi (Firebase veya JSON) getirir.
     * Bu fonksiyon, eşit karma yapısını korumak için sırayla kaynakları dener.
     * @returns {Promise<object|null>} Bir sonraki öğe veya null.
     */
    const getNextHybridItem = useCallback(async () => {
        let isJsonTurn = history.length % 2 !== 0; // 0:FB, 1:JSON, 2:FB...

        // 1. Eşit Karma Mantığı
        if (!firebaseExhausted && !jsonExhausted) {
            if (isJsonTurn) {
                // Önce JSON'u dene
                const jsonItem = getNextJsonItem();
                if (jsonItem) return jsonItem;
                
                // JSON bulunamazsa, Firebase'i dene
                const firebaseItem = await getNextFirebaseItem();
                if (firebaseItem) return firebaseItem;
            } else { // Firebase sırası
                // Önce Firebase'i dene
                const firebaseItem = await getNextFirebaseItem();
                if (firebaseItem) return firebaseItem;

                // Firebase bulunamazsa, JSON'u dene
                const jsonItem = getNextJsonItem();
                if (jsonItem) return jsonItem;
            }
        }
        
        // 2. Tükenme Mantığı (Bir kaynak bittiyse, diğerinden devam et)
        if (!firebaseExhausted) {
             const firebaseItem = await getNextFirebaseItem();
             if (firebaseItem) return firebaseItem;
        }

        if (!jsonExhausted) {
            const jsonItem = getNextJsonItem();
            if (jsonItem) return jsonItem;
        }
        
        // Tüm kaynaklar tükendi
        return null; 
        
    }, [history.length, firebaseExhausted, jsonExhausted, getNextFirebaseItem, getNextJsonItem]);


    // ==========================================================
    // EFEKTLER VE NAVİGASYON
    // ==========================================================

    // 📌 1. İlk Yükleme: Sadece ilk öğeyi getir.
    useEffect(() => {
        const initialLoad = async () => {
            if (history.length > 0 || isFetching) return; 

            setLoading(true);
            setIsFetching(true);
            
            const initialItem = await getNextHybridItem(); // Hibrid yolla ilk öğeyi getir

            if (initialItem) {
                setHistory([initialItem]);
                setCurrentIndex(0);
                // İlk gösterilen öğeyi hemen seen olarak işaretle
                markItemAsSeen(
                    initialItem.source === 'firebase' ? FIREBASE_SEEN_KEY : JSON_SEEN_KEY,
                    initialItem.id
                );
            }
            
            setLoading(false);
            setIsFetching(false);
        };
        
        initialLoad();
        
    }, []); // Sadece bileşen yüklendiğinde çalışır

    
    // 📌 Aşağı (Sonraki) Butonu: Geçmişi ilerletir veya yeni veri çeker
    const handleNext = useCallback(async () => {
        if (isFetching) return;

        // 1. Eğer geçmişte geri gelinmişse, ileri git (mevcut history'deki bir sonraki item'a).
        if (currentIndex < history.length - 1) {
            setCurrentIndex(prev => prev + 1);
            return;
        }

        // 2. Geçmişin sonundaysak, yeni item getir.
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
            // Yeni gösterilen öğeyi seen olarak işaretle
            markItemAsSeen(
                nextItem.source === 'firebase' ? FIREBASE_SEEN_KEY : JSON_SEEN_KEY,
                nextItem.id
            );
        } else {
            console.log("Daha fazla yeni içerik bulunamadı.");
        }

    }, [currentIndex, history.length, firebaseExhausted, jsonExhausted, getNextHybridItem, isFetching]);

    // 📌 Yukarı (Önceki) Butonu: Geçmişte geri gider
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
        
    // Tüm içerikler tükendi ve history boşsa veya son itemdaysa
    if (!currentItem && firebaseExhausted && jsonExhausted)
        return (
            <div className={styles.feedWrapper} style={{justifyContent: 'center', alignItems: 'center', height: '100vh', padding: '20px'}}>
                <p>Tebrikler! Şu an için gösterilebilecek **tüm** Firebase ve Yerel içerikleri gördünüz.</p>
                <button 
                    onClick={() => {
                        // Görülenleri temizleyip sıfırdan başlama seçeneği
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
    
    // 🔥 Kart Seçimi: Gelen verinin kaynağına göre doğru bileşeni çağır
    
    // DiscoverVideoCard (Firebase) ve DataDiscover (JSON) prop isimleri farklı olduğu için ayrı ayrı render ediliyor.
    if (currentItem.source === 'firebase') {
        return (
            <div className={styles.feedWrapper}>
                {/* DiscoverVideoCard onNextPost/onPrevPost kullanır */}
                <DiscoverVideoCard 
                    key={currentItem.id} 
                    data={currentItem} 
                    onNextPost={handleNext} 
                    onPrevPost={handlePrev} 
                    isFirstItem={isFirstItem}
                    isLastItem={isLastItemAndExhausted} // Son butonu devre dışı bırakmak için
                />
                 {/* DiscoverVideoCard'ın kendi butonları yoksa, bu dış butonları kullanırız */}
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
    
    if (currentItem.source === 'json') {
        return (
             <div className={styles.feedWrapper}>
                {/* DataDiscover onNext/onPrev kullanır ve kendi içinde navigasyon butonlarını render eder */}
                <DataDiscover
                    key={currentItem.id}
                    data={currentItem}
                    onNext={handleNext}
                    onPrev={handlePrev}
                    isPrevDisabled={isFirstItem}
                    isNextDisabled={isLastItemAndExhausted}
                    isNextLoading={isNextLoading} // Yeni loading prop'u
                />
            </div>
        );
    }
}