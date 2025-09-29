import React from 'react';
import styles from './VideoThumbnail.module.css';

// Küçük kart görünümü için video id'sini alıp bir thumbnail oluşturur
const getYouTubeThumbnail = (url) => {
  if (!url || typeof url !== 'string') {
    return null;
  }
  
  let videoIdMatch;
  // Gelen URL'de "embed" ifadesini arıyoruz
  if (url.includes("/embed/")) {
    const embedId = url.split("/embed/")[1].split("?")[0];
    videoIdMatch = [url, embedId];
  } else {
    // Normal YouTube veya Shorts URL'si için regex kullanıyoruz
    videoIdMatch = url.match(/(?:\/shorts\/|youtu\.be\/|v=)([^&?/]+)/);
  }

  if (videoIdMatch && videoIdMatch[1]) {
    const videoId = videoIdMatch[1];
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }

  return null;
};

const VideoThumbnail = ({ mediaUrl, onClick }) => {
  const thumbnailUrl = getYouTubeThumbnail(mediaUrl);

  if (!thumbnailUrl) {
    return null;
  }

  return (
    <div className={styles.thumbnail_container} onClick={onClick}>
      <img src={thumbnailUrl} alt="Video Thumbnail" className={styles.thumbnail_image} />
    </div>
  );
};

export default VideoThumbnail;