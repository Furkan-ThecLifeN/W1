// DeleteFeedModal.jsx

import React from "react";
import styles from "./DeleteFeedModal.module.css";
import { FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const DeleteFeedModal = ({ show, onClose, onDelete }) => {
  if (!show) {
    return null;
  }

  const handleWrapperClick = (e) => {
    // İçeriğe tıklamaları engelle
    e.stopPropagation();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={styles.deleteModalOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose} // Dışarı tıklayınca kapat
        >
          <motion.div
            className={styles.deleteModalContent}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            onClick={handleWrapperClick}
          >
            <div className={styles.modalHeader}>
              <h3>Gönderiyi Sil</h3>
              <button onClick={onClose} className={styles.closeButton}>
                <FiX size={24} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <p>Bu gönderiyi kalıcı olarak silmek istediğinizden emin misiniz?</p>
              <button
                onClick={onDelete}
                className={styles.deleteButton}
              >
                Sil
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeleteFeedModal;