import React from 'react';
import { FiSend } from 'react-icons/fi';
import { IoMdClose } from 'react-icons/io';
import styles from '../StoriesAdd.module.css';

const StoryHeader = ({ onClose, onSubmit, hasMedia }) => {
  return (
    <div className={styles.storyHeader}>
      <button className={styles.closeButton} onClick={onClose}>
        <IoMdClose size={24} />
      </button>
      <h2 className={styles.formTitle}>Story Oluştur</h2>
      <button
        className={`${styles.postButton} ${hasMedia ? styles.active : ''}`}
        onClick={onSubmit}
        disabled={!hasMedia}
      >
        <FiSend size={18} />
        <span>Paylaş</span>
      </button>
    </div>
  );
};

export default StoryHeader;