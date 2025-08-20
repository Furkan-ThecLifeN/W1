import React, { useState, useEffect } from "react";
import styles from "./PrivacySettings.module.css";
import { FiLock} from "react-icons/fi";
import { useUser } from "../../../../context/UserContext";
import { useAuth } from "../../../../context/AuthProvider";
import { auth } from "../../../../config/firebase-client"; // ✅ ÇÖZÜM: 'auth' nesnesi import edildi

const PrivacySettings = () => {
  const { currentUser, setCurrentUser, loading } = useUser();
  const { showToast } = useAuth();
  const [isPrivate, setIsPrivate] = useState(currentUser?.isPrivate || false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setIsPrivate(currentUser.isPrivate || false);
    }
  }, [currentUser]);

  const handleToggle = async () => {
    if (isUpdating) return;

    setIsUpdating(true);
    const newPrivacyStatus = !isPrivate;

    try {
      const idToken = await auth.currentUser.getIdToken();
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/users/privacy`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ isPrivate: newPrivacyStatus }),
      });

      if (res.ok) {
        // Frontend state'ini güncelle
        setIsPrivate(newPrivacyStatus);
        setCurrentUser({ ...currentUser, isPrivate: newPrivacyStatus });
        showToast("Privacy settings updated successfully.", "success");
      } else {
        const errorData = await res.json();
        showToast(errorData.error || "Failed to update privacy settings.", "error");
      }
    } catch (error) {
      console.error("Privacy update error:", error);
      showToast("An error occurred. Please try again.", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Veya daha profesyonel bir yükleme ekranı
  }

  return (
    <div className={styles.wrapper}>
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
          role="switch"
          aria-checked={isPrivate}
          tabIndex="0"
        >
          <div className={styles.slider}></div>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;