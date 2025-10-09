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
    // Hem standart URL'leri (v=) hem de Shorts URL'lerini (/shorts/) yakalamak için güncellenmiş regex
    const videoIdMatch = url.match(
      /(?:youtu\.be\/|v=|\/embed\/|\/v\/|\/watch\?v=|\/shorts\/)([a-zA-Z0-9_-]{11})/
    );

    if (videoIdMatch && videoIdMatch[1]) {
      // Shorts'lar için rel=0 eklenebilir, ancak burada sadece temel embed linkini oluşturuyoruz.
      // Shorts videoları için 'embed/' yerine 'shorts/' da kullanılabilir, ancak iframe genellikle 'embed' ister.
      return `https://www.youtube.com/embed/${videoIdMatch[1]}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoIdMatch[1]}`;
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
    isNextLoading // ✅ YENİ PROP EKLENDİ
}) {
  // Veriden embed linkini al
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
              // Shorts videolarında (dikey format) tam ekran izleme deneyimi için önerilen izinler:
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
                // ✅ isNextLoading kontrolü eklendi
                disabled={isNextDisabled || isNextLoading} 
                aria-label="Sonraki İçerik"
            >
              {isNextLoading ? ( // ✅ Yükleme durumu kontrolü
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