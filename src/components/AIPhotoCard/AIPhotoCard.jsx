import React from "react";
import styles from "./AIPhotoCard.module.css";

// Telif ve kaynak bilgilerini daha belirgin göstermek için bir ikon
const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ marginRight: "6px", opacity: 0.8 }}
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const PhotoCard = ({ photo }) => {
  if (!photo || !photo.image) return null;

  // Fotoğrafçı/kullanıcı bilgisi ve linkini tek bir değişkende toplayalım
  let creatorName = null;
  let creatorUrl = null;

  if (photo.source === "pexels" && photo.meta?.photographer) {
    creatorName = photo.meta.photographer;
    // Pexels API'sinde fotoğrafçı profili için genelde 'photographer_url' kullanılır.
    creatorUrl = photo.meta.photographer_url;
  } else if (photo.source === "unsplash" && photo.meta?.user) {
    creatorName = photo.meta.user;
    // Unsplash API'sinde kullanıcı profili için 'user.links.html' kullanılır.
    creatorUrl = photo.meta.user_url;
  }

  // Telif bilgisini gösterecek iç bileşen
  const Attribution = () => {
    if (!creatorName) return null;

    const content = (
      <>
        <UserIcon />
        {creatorName}
      </>
    );

    // Eğer bir URL varsa, içeriği tıklanabilir bir link haline getir
    if (creatorUrl) {
      return (
        <a
          href={creatorUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.attributionLink}
        >
          {content}
        </a>
      );
    }

    // URL yoksa, sadece metin olarak göster
    return <p className={styles.attributionText}>{content}</p>;
  };

  return (
    <div className={styles.photoCard}>
      {/* Sponsorlu İçerik Alanı */}
      <div className={styles.adBanner}>
        <span>Sponsorlu</span>
      </div>

      <div className={styles.photoContainer}>
        {/* lazy loading ile performansı artırıyoruz */}
        <img
          src={photo.image}
          alt={photo.title}
          className={styles.photoImage}
          loading="lazy"
        />

        {/* Bilgi Katmanı (Overlay) */}
        <div className={styles.infoOverlay}>
          <h3 className={styles.title}>{photo.title}</h3>
          <div className={styles.meta}>
            <Attribution />
            {photo.source === "civitai" && photo.score !== null && (
              <p className={styles.civitaiScore}>⭐ {photo.score} favorites</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoCard;