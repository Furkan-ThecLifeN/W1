import React from "react";
import styles from "./ContentDisplay.module.css";

const ContentDisplay = ({ title, onBack }) => {
  const dummyContent = Array.from({ length: 12 }).map(
    (_, i) => `${title} ${i + 1}`
  );

  return (
    <div className={styles.contentContainer}>
      {onBack && (
        <button onClick={onBack} className={styles.backButton}>
          ← Back
        </button>
      )}

      <div className={styles.profileWrapper}>
        <div className={styles.profileOuter}>
          <div className={styles.profileInner}>
            <img
              src="https://c.files.bbci.co.uk/C120/production/_104304494_mediaitem104304493.jpg"
              alt="profile"
              className={styles.profileImage}
            />
          </div>
        </div>
      </div>

      <div className={styles.scrollableGrid}>
        {dummyContent.map((item, index) => (
          <div key={index} className={styles.contentItem}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentDisplay;
