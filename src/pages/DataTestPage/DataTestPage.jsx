import React, { useState, useEffect, useMemo } from 'react';
import DataDiscover from '../../components/data-discover/DataDiscover';
// JSON verisini import et
import allVideos from '../../data/explore.json'; 

// 📌 Sabitler
const SEEN_VIDEOS_KEY = 'seenVideosHistory';
const EXPIRATION_DURATION = 14 * 24 * 60 * 60 * 1000; // 14 gün (2 hafta) milisaniye cinsinden

// Rastgele index seçmek için yardımcı fonksiyon (Artık ID'ler ile çalışacak)
const getRandomUnseenVideo = (videoList, seenIds) => {
    // Görülmemiş videoları filtrele
    const unseenVideos = videoList.filter(video => !seenIds.includes(video.id));

    if (unseenVideos.length === 0) {
        return null; // Tüm videolar görüldü
    }

    // Görülmemiş videolardan rastgele birini seç
    const randomIndex = Math.floor(Math.random() * unseenVideos.length);
    return unseenVideos[randomIndex];
};

// 📌 localStorage'ı yöneten yardımcı fonksiyonlar
const updateSeenVideosHistory = (newVideoId) => {
    try {
        const storedData = localStorage.getItem(SEEN_VIDEOS_KEY);
        let history = storedData ? JSON.parse(storedData) : {};
        
        // Yeni videonun ID'sini ve güncel zaman damgasını ekle/güncelle
        history[newVideoId] = Date.now();
        
        localStorage.setItem(SEEN_VIDEOS_KEY, JSON.stringify(history));
    } catch (e) {
        console.error("Local storage'a yazma hatası:", e);
    }
};

const getAndCleanSeenVideos = (videoList) => {
    try {
        const storedData = localStorage.getItem(SEEN_VIDEOS_KEY);
        let history = storedData ? JSON.parse(storedData) : {};
        const now = Date.now();
        const expirationTime = EXPIRATION_DURATION;

        let cleanedHistory = {};
        let seenIds = [];

        // 1. Süresi dolanları temizle
        // 2. Halihazırda var olmayan (JSON'dan silinmiş) ID'leri temizle
        const validVideoIds = videoList.map(v => v.id);

        for (const id in history) {
            const timestamp = history[id];
            
            // Süresi dolmamış VE JSON'da halen var olan video ID'lerini koru
            if (now - timestamp < expirationTime && validVideoIds.includes(id)) {
                cleanedHistory[id] = timestamp;
                seenIds.push(id);
            }
        }
        
        localStorage.setItem(SEEN_VIDEOS_KEY, JSON.stringify(cleanedHistory));
        return seenIds;
    } catch (e) {
        console.error("Local storage'dan okuma/temizleme hatası:", e);
        return []; // Hata durumunda boş liste döndür
    }
};


function DataTestPage() {
    const videoList = useMemo(() => allVideos, []);
    
    // [video_id_1, video_id_2, ...] gibi ziyaret edilen video ID'lerinin sırası (Session History)
    const [history, setHistory] = useState([]); 
    
    // Geçmişteki hangi videodayız. (history[currentIndex] o anki videonun ID'si)
    const [currentIndex, setCurrentIndex] = useState(-1); 
    
    // O an gösterilen videonun verisi
    const [currentVideoData, setCurrentVideoData] = useState(null);

    // 📌 1. useEffect: Local Storage Temizliği ve İlk Video Yükleme
    useEffect(() => {
        if (videoList.length === 0) return;

        // Görülmüş ve süresi dolmamış ID'leri al
        const seenIds = getAndCleanSeenVideos(videoList); 

        // Görülmemiş rastgele bir video bul
        const initialVideo = getRandomUnseenVideo(videoList, seenIds);

        if (initialVideo) {
            // Yeni geçmişi oluştur ve local storage'ı güncelle
            setHistory([initialVideo.id]);
            setCurrentIndex(0);
            setCurrentVideoData(initialVideo);
            updateSeenVideosHistory(initialVideo.id);
        } else {
            // Eğer tüm videolar görüldüyse, listenin en başından başla (veya özel bir mesaj göster)
            console.log("Tüm videolar görüldü, baştan başlıyor.");
            const firstVideo = videoList[0];
            setHistory([firstVideo.id]);
            setCurrentIndex(0);
            setCurrentVideoData(firstVideo);
            // Bu durumda updateSeenVideosHistory'i çağırmıyoruz, çünkü zaten görülmüş.
        }
    }, [videoList]); // videoList değiştiğinde sadece bir kez çalışır

    // 📌 2. useEffect: History veya currentIndex değiştiğinde mevcut videoyu güncelle
    useEffect(() => {
        if (currentIndex >= 0 && currentIndex < history.length) {
            const videoId = history[currentIndex];
            const video = videoList.find(v => v.id === videoId);
            
            if (video) {
                setCurrentVideoData(video);
            } else {
                // Eğer history'de olmayan bir ID varsa (normalde olmamalı)
                setCurrentVideoData(null);
            }
        }
    }, [currentIndex, history, videoList]);


    // Aşağı (Sonraki) Butonu: Rastgele, daha önce gelmeyen yeni video getirir (veya geçmişte ileri gider).
    const handleNext = () => {
        if (currentIndex < history.length - 1) {
            // Geçmişte ileri git
            setCurrentIndex(prev => prev + 1);
        } else {
            // Geçmişin sonundaysa, yeni rastgele video getir
            const seenIds = getAndCleanSeenVideos(videoList); 
            const newVideo = getRandomUnseenVideo(videoList, [...seenIds, ...history]); // Geçerli oturumdaki videoları da ekle

            if (newVideo) {
                setHistory(prev => [...prev, newVideo.id]);
                setCurrentIndex(prev => prev + 1);
                updateSeenVideosHistory(newVideo.id);
            } else {
                console.log("Tüm videolar gösterildi. Daha fazla yeni video yok.");
            }
        }
    };

    // Yukarı (Önceki) Butonu: Geçmişteki bir önceki videoyu getirir.
    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };
    
    // Yükleme durumu
    if (!currentVideoData) {
        return <div style={{height:'100vh', display:'flex', justifyContent:'center', alignItems:'center', color:'white', backgroundColor:'#1a1a1a'}}>
            <p>Video verileri yükleniyor veya gösterilecek yeni video yok...</p>
        </div>;
    }

    return (
        // DataDiscover'a gerekli bilgileri prop olarak geç
        <DataDiscover
            data={currentVideoData}
            onNext={handleNext}
            onPrev={handlePrev}
            isPrevDisabled={currentIndex === 0}
            // Tüm videolar görüldü ve geçmişin sonundaysa Next butonu disabled olur.
            isNextDisabled={history.length === videoList.length && currentIndex === history.length - 1} 
        />
    );
}

export default DataTestPage;