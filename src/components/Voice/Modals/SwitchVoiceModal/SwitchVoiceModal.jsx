import React from "react";
import styles from "./SwitchVoiceModal.module.css";
import { FaExclamationTriangle, FaExchangeAlt, FaTimes } from "react-icons/fa";

const SwitchVoiceModal = ({ targetChannelName, onConfirm, onCancel }) => {
  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Kapatma Butonu */}
        <button className={styles.closeBtn} onClick={onCancel}>
          <FaTimes />
        </button>

        <div className={styles.content}>
          <div className={styles.iconWrapper}>
            <div className={styles.pulseRing}></div>
            <FaExchangeAlt className={styles.mainIcon} />
          </div>

          <h2 className={styles.title}>Kanal Değiştirilsin mi?</h2>
          
          <p className={styles.description}>
            Zaten bir ses kanalındasın. Mevcut bağlantını kesip 
            <span className={styles.targetName}> #{targetChannelName}</span> 
            odasına geçmek istediğinden emin misin?
          </p>

          <div className={styles.warningBox}>
            <FaExclamationTriangle className={styles.warningIcon} />
            <span>Mevcut yayının sonlandırılacak.</span>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onCancel}>
            Vazgeç
          </button>
          <button className={styles.confirmBtn} onClick={onConfirm}>
            Odaya Katıl
          </button>
        </div>
      </div>
    </div>
  );
};

export default SwitchVoiceModal;