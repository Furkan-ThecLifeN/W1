import React from 'react';
import { FiImage } from 'react-icons/fi';
import styles from '../StoriesAdd.module.css';

const UploadArea = ({ fileInputRef, handleMediaUpload }) => {
  return (
    <div className={styles.uploadArea}>
      <div className={styles.uploadPrompt}>
        <FiImage size={48} className={styles.uploadIcon} />
        <p>Fotoğraf veya video ekleyin</p>
        <button
          className={styles.uploadButton}
          onClick={() => fileInputRef.current.click()}
        >
          Dosya Seç
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleMediaUpload}
          accept="image/*,video/*"
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};

export default UploadArea;