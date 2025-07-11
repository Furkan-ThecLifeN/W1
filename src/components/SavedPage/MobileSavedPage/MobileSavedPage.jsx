import React, { useState } from 'react';
import styles from './MobileSavedPage.module.css';

const buttons = ['Feeds', 'Post', 'Story', 'Alıntılar', 'Koleksiyonlar'];

const MobileSavedPage = () => {
  const [active, setActive] = useState(null);
  const dummyContent = Array.from({ length: 20 }, (_, i) => `${active} ${i + 1}`);

  return (
    <div className={styles.pageContainer}>
      <header className={styles.headerLogo}>W1</header>

      <div className={styles.buttonRow}>
        {buttons.map((label) => (
          <button
            key={label}
            className={`${styles.tabButton} ${active === label ? styles.active : ''}`}
            onClick={() => setActive(label)}
          >
            {label}
          </button>
        ))}
      </div>

      {!active && <div className={styles.centerLogo}>W1</div>}

      <div className={styles.contentGrid}>
        {active && dummyContent.map((item, i) => (
          <div key={i} className={styles.contentCard}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MobileSavedPage;