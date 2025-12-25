// ConfirmModal.jsx
import React from "react";
import styles from "./ConfirmModal.module.css";

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, type = "danger" }) => {
  if (!isOpen) return null;
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel}>Vazgeç</button>
          <button className={type === "danger" ? styles.dangerBtn : styles.primaryBtn} onClick={onConfirm}>
            Onayla
          </button>
        </div>
      </div>
    </div>
  );
};
export default ConfirmModal;