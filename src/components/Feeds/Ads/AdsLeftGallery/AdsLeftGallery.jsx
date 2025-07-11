import { useState } from "react";
import styles from "./AdsLeftGallery.module.css";

export default function AdsLeftGallery({ ads }) {
  const [visibleAds, setVisibleAds] = useState(ads);

  const handleClose = (index) => {
    setVisibleAds((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.container}>
      {visibleAds.map((ad, i) => (
        <div key={i} className={styles.adBox}>
          <button
            className={styles.closeBtn}
            onClick={() => handleClose(i)}
            aria-label="Close ad"
          >
            ×
          </button>
          <a href={ad.link} target="_blank" rel="noopener noreferrer">
            <img src={ad.image} alt={`Ad ${i + 1}`} className={styles.adImage} />
          </a>
        </div>
      ))}
    </div>
  );
}
