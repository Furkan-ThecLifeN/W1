import React, { useEffect, useRef } from 'react';
import styles from './ScreenShareView.module.css';

const ScreenShareView = ({ stream }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={styles.container}>
      <div className={styles.videoWrapper}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={styles.video}
        />
        <div className={styles.liveBadge}>
          🔴 Canlı Yayında
        </div>
      </div>
    </div>
  );
};

export default ScreenShareView;