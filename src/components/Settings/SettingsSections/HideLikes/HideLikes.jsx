// src/components/Settings/SettingsSections/HideLikes/HideLikes.jsx
import React, { useState, useEffect } from "react";
import styles from "./HideLikes.module.css";
import { FiEyeOff, FiEye } from "react-icons/fi";
import { useUser } from "../../../../context/UserContext";
import LoadingOverlay from "../../../LoadingOverlay/LoadingOverlay";

const HideLikes = () => {
  const { currentUser, updateHideLikes } = useUser();
  const [localHideLikes, setLocalHideLikes] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setLocalHideLikes(currentUser.privacySettings.hideLikes);
    }
  }, [currentUser]);

  const handleToggle = async () => {
    setIsUpdating(true);
    const success = await updateHideLikes(!localHideLikes);
    if (success) {
      setLocalHideLikes(!localHideLikes);
    }
    setIsUpdating(false);
  };

  if (!currentUser) {
    return <LoadingOverlay />;
  }

  return (
    <div className={styles.container}>
      {isUpdating && <LoadingOverlay />}
      <h2 className={styles.title}>Beğenmeleri Gizle</h2>
      <p className={styles.description}>
        Gönderilerinizdeki beğeni sayısını başkalarından gizleyin.
      </p>
      <div className={styles.toggleCard}>
        <div className={styles.toggleContent}>
          <div className={styles.icon}>
            {localHideLikes ? <FiEyeOff size={24} /> : <FiEye size={24} />}
          </div>
          <p className={styles.toggleText}>
            Gönderilerinizdeki beğeni sayısını gizle
          </p>
        </div>
        <label className={styles.switch}>
          <input
            type="checkbox"
            checked={localHideLikes}
            onChange={handleToggle}
            disabled={isUpdating}
          />
          <span className={styles.slider}></span>
        </label>
      </div>
    </div>
  );
};

export default HideLikes;
