import React, { useState } from "react";
import styles from "./VideoPostCard.module.css";

const getYouTubeVideoId = (url) => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('youtube.com')) return urlObj.searchParams.get('v');
    if (urlObj.hostname.includes('youtu.be')) return urlObj.pathname.substring(1);
  } catch (error) {
    console.error("Geçersiz URL:", error);
  }
  return null;
};

const VideoPostCard = ({ data }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!data || !data.url || !data.thumbnail) return null;

  const videoId = getYouTubeVideoId(data.url);
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&rel=0` : '';

  return (
    <div className={styles.video_card_container}>
      {/* AD Banner */}
      <div className={styles.ad_banner}>
        <span>W1</span>
      </div>

      <div className={styles.video_wrapper}>
        {isPlaying && embedUrl ? (
          <iframe
            className={styles.video_iframe}
            src={embedUrl}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={data.title}
          ></iframe>
        ) : (
          <>
            <img
              src={data.thumbnail}
              alt={data.title}
              className={styles.video_thumbnail}
              onClick={() => setIsPlaying(true)}
            />
            <div className={styles.video_overlay} onClick={() => setIsPlaying(true)}>
              <div className={styles.play_button}>▶</div>
            </div>
          </>
        )}
      </div>

      <div className={styles.video_info}>
        <h3 className={styles.video_title}>{data.title || "Video Başlığı"}</h3>
        {data.description && <p className={styles.video_description}>{data.description}</p>}
        <div className={styles.video_meta}>
          {data.author && <span className={styles.video_author}>{data.author}</span>}
          {data.publishedAt && <span className={styles.video_date}>{new Date(data.publishedAt).toLocaleDateString()}</span>}
        </div>
      </div>
    </div>
  );
};

export default VideoPostCard;
