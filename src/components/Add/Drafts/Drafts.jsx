import React from 'react';
import styles from './Drafts.module.css';

const Drafts = ({ onClose }) => {
  return (
    <div className={styles.draftsWrapper}>
      <h2 className={styles.title}>Kaydedilen Taslaklar</h2>
      <p className={styles.info}>Henüz paylaşmadığın içerikler burada listelenecek.</p>
      <div className={styles.placeholder}>
        📂 Şimdilik hiç taslak yok.
      </div>
      <button className={styles.closeBtn} onClick={onClose}>Geri Dön</button>
    </div>
  );
};

export default Drafts;
