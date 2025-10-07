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
      // Oynatıcı kontrolleri ile embed URL'si
      return `https://www.youtube.com/embed/${videoIdMatch[1]}?autoplay=0&controls=1`;
    }
  } catch (e) {
    console.error("Invalid URL", e);
  }
  return null;
};

// Component Adı Güncellendi: VideoPlayerPage yerine DataDiscover
const DataDiscover = ({ 
    data = defaultData, 
    onNext, // DataTestPage'den gelecek
    onPrev, // DataTestPage'den gelecek
    isPrevDisabled, // DataTestPage'den gelecek
    isNextDisabled // DataTestPage'den gelecek
}) => {
  const embedUrl = getEmbedUrl(data.url);

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        <div className={styles.videoBox}>
          {embedUrl ? (
            <iframe
              key={data.id} // Key ekleyerek iframe'in data değiştiğinde yeniden yüklenmesini sağla
              className={styles.videoPlayer}
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
                disabled={isNextDisabled}
                aria-label="Sonraki İçerik"
            >
              <FiArrowDown size={24} className={styles.arrow} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataDiscover;