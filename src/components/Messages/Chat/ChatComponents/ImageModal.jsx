// src/components/Chat/ChatComponents/ImageModal.jsx

import React from 'react';
import styles from './ImageModal.module.css';

const ImageModal = ({ src, onClose }) => {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>&times;</button>
        <img src={src} alt="Full-size" className={styles.fullImage} />
      </div>
    </div>
  );
};

export default ImageModal;