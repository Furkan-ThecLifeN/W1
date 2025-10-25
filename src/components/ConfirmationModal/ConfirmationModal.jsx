// components/ConfirmationModal/ConfirmationModal.jsx
import React from "react";
import styles from "./ConfirmationModal.module.css";

const ConfirmationModal = ({
  show,
  onClose,
  onConfirm,
  title,
  message,
  cancelText = "İptal",
  confirmText = "Onayla",
  confirmType = "default", // 'default' veya 'danger' olabilir
}) => {
  if (!show) {
    return null;
  }

  // Onay butonunun rengini belirlemek için
  const confirmButtonClass =
    confirmType === "danger"
      ? styles.confirmButtonDanger
      : styles.confirmButton;

  return (
    // Overlay (dışarıya tıklayınca kapat)
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()} // Modal'ın içine tıklayınca kapanmasını engelle
      >
        <h3>{title}</h3>
        <p>{message}</p>
        <div className={styles.buttons}>
          <button className={styles.cancelButton} onClick={onClose}>
            {cancelText}
          </button>
          <button className={confirmButtonClass} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;