import { useState, useEffect } from "react";
import styles from "./AdsRightVideo.module.css";

export default function AdsRightVideo({ videoSrc, link }) {
  const [show, setShow] = useState(true);
  const [counter, setCounter] = useState(7);

  useEffect(() => {
    const timer = setInterval(() => {
      setCounter((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!show) return null;

  return (
    <div className={styles.container}>
      <button
        className={styles.closeBtn}
        disabled={counter > 0}
        onClick={() => setShow(false)}
        aria-label="Close advertisement"
      >
        ×
      </button>
      <a href={link} target="_blank" rel="noopener noreferrer" className={styles.adLink}>
        <video
          src={videoSrc}
          muted
          loop
          autoPlay
          playsInline
          className={styles.video}
        />
        <span className={styles.cta}>Visit Ad</span>
      </a>
    </div>
  );
}
