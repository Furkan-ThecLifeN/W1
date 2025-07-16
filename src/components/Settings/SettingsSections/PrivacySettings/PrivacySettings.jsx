import React, { useState } from "react";
import styles from "./PrivacySettings.module.css";
import { FiLock, FiCheckCircle } from "react-icons/fi";

const PrivacySettings = () => {
  const [isPrivate, setIsPrivate] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleToggle = () => {
    setIsPrivate(!isPrivate);
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  };

  return (
    <div className={styles.wrapper}>
      {saved && (
        <div className={styles.toast}>
          <FiCheckCircle /> Privacy updated successfully.
        </div>
      )}

      <h2 className={styles.heading}>
        <FiLock /> Account Privacy
      </h2>
      <p className={styles.subtext}>
        Control who can see your posts and profile. Switch to private to protect your account.
      </p>

      <div className={styles.privacyBox}>
        <div className={styles.privacyText}>
          <strong>Private Account</strong>
          <span>Only approved followers can see your posts.</span>
        </div>

        <div
          className={`${styles.switch} ${isPrivate ? styles.active : ""}`}
          onClick={handleToggle}
        >
          <div className={styles.slider}></div>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;
