// src/components/Chat/ChatComponents/ImageViewerModal.jsx

import React from "react";
import styles from "./ImageViewerModal.module.css";
import { FaTimes } from "react-icons/fa"; 
import { HiPhoto } from "react-icons/hi2";

const ImageViewerModal = ({ imageUrl, onClose, fileName }) => {
  if (!imageUrl) return null;

  // Artık indirmek yerine yeni sekmede açacak
  const handleOpen = () => {
    window.open(imageUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <FaTimes />
        </button>
        <img src={imageUrl} alt="Full Screen" className={styles.fullImage} />
        <button className={styles.downloadButton} onClick={handleOpen}>
          <HiPhoto  /> Open
        </button>
      </div>
    </div>
  );
};

export default ImageViewerModal;
