import React from "react";
import styles from "./DataDiscover.module.css";
// Iconları dahil edelim
import { FiArrowDown, FiArrowUp } from "react-icons/fi"; 

// Varsayılan bir veri (Eğer DataTestPage'den veri gelmezse kullanılır)
const defaultData = {
  id: "0",
  type: "video",
  title: "Varsayılan Başlık",
  url: "https://www.youtube.com/watch?v=F3zWvGvS5pI",
  thumbnail: "https://img.youtube.com/vi/F3zWvGvS5pI/0.jpg",
  duration: "0:00",
  tags: ["default"],
  seen: false,
  date: "2024-01-01T00:00:00Z",
};

// YouTube URL'sini embed edilebilir formata dönüştürme (SHORTS DESTEĞİ EKLENDİ)
const getEmbedUrl = (url) => {
  try {
    const videoIdMatch = url.match(
      /(?:youtu\.be\/|v=|\/embed\/|\/v\/|\/watch\?v=|\/shorts\/)([a-zA-Z0-9_-]{11})/
    );

    if (videoIdMatch && videoIdMatch[1]) {
      // ✅ DÜZELTME: `autoplay=1` ve `mute=1` parametreleri kaldırıldı.
      // Bu sayede video otomatik başlamaz, kullanıcı tıkladığında sesli başlar.
      // `controls=1` parametresi oynatıcı kontrollerinin görünür kalmasını sağlar.
      return `https://www.youtube.com/embed/${videoIdMatch[1]}?controls=1&loop=1&playlist=${videoIdMatch[1]}`;
    }
    return null;
  } catch (e) {
    console.error("URL dönüştürme hatası:", e);
    return null;
  }
};

export default function DataDiscover({ 
    data = defaultData, 
    onNext, 
    onPrev, 
    isPrevDisabled, 
    isNextDisabled,
    isNextLoading 
}) {
  const embedUrl = getEmbedUrl(data.url);

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        
        {/* SOL KUTU: Video Alanı */}
        <div className={styles.videoBox}>
          {embedUrl ? (
            <iframe
              className={styles.mediaFrame}
              src={embedUrl}
              title={data.title}
              frameBorder="0"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            ></iframe>
          ) : (
            <div className={styles.errorText}>
              Video linki geçersiz veya bulunamadı. ID: {data.id}
            </div>
          )}
        </div>

        {/* SAĞ KUTU: Kontroller Alanı */}
        <div className={styles.controlsBox}>
          <div className={styles.w1Title}>W1</div>
          
          {/* Buraya diğer kontrol butonları (Like, Comment vs.) gelebilir. */}
          
          <div className={styles.navigationControls}>
            <button 
                className={styles.navButton} 
                onClick={onPrev}
                disabled={isPrevDisabled}
                aria-label="Önceki İçerik"
            >
              <FiArrowUp size={24} className={styles.arrow} />
            </button>
            <button 
                className={styles.navButton} 
                onClick={onNext}
                disabled={isNextDisabled || isNextLoading} 
                aria-label="Sonraki İçerik"
            >
              {isNextLoading ? (
                  <span style={{ fontSize: '12px', color: 'white' }}>Yükleniyor...</span>
              ) : (
                  <FiArrowDown size={24} className={styles.arrow} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}