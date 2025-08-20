// src/components/NotificationsSettings.jsx

import React, { useState, useEffect } from "react";
import styles from "./NotificationsSettings.module.css";
import { FiBell, FiMail, FiHeart, FiUserPlus, FiSmartphone } from "react-icons/fi";
import { getUserNotificationSettings, updateUserNotificationSettings } from "../../../../services/notifications"; // ✅ Yeni: API servisleri
import { useAuth } from "../../../../context/AuthProvider"; // ✅ Toast mesajları için

const NotificationsSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useAuth(); // Toast fonksiyonunu al

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const fetchedSettings = await getUserNotificationSettings();
        setSettings(fetchedSettings);
      } catch (error) {
        showToast("error", "Ayarlar çekilirken bir hata oluştu.");
        console.error("Failed to fetch notification settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [showToast]);

  const toggleSetting = async (key) => {
    // Optimistic UI: UI'ı anında güncelle
    const previousSettings = { ...settings };
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

    try {
      // Backend'e sadece değişen ayarı gönder
      await updateUserNotificationSettings({ [key]: !previousSettings[key] });
      showToast("success", "Ayarlar başarıyla güncellendi.");
    } catch (error) {
      // Hata durumunda UI'ı eski haline getir
      setSettings(previousSettings);
      showToast("error", "Ayarlar güncellenirken bir hata oluştu.");
      console.error("Failed to update notification settings:", error);
    }
  };

  if (loading) {
    return <div className={styles.wrapper}>Loading...</div>;
  }

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}><FiBell /> Notification Settings</h2>
      <p className={styles.subtext}>Manage how you receive alerts and notifications.</p>

      {settings && (
        <>
          <div className={styles.option}>
            <div className={styles.label}>
              <FiMail /> Email Notifications
            </div>
            <div
              className={`${styles.toggle} ${settings.email ? styles.active : ""}`}
              onClick={() => toggleSetting("email")}
            >
              <div className={styles.circle}></div>
            </div>
          </div>
          <div className={styles.option}>
            <div className={styles.label}>
              <FiSmartphone /> Push Notifications
            </div>
            <div
              className={`${styles.toggle} ${settings.push ? styles.active : ""}`}
              onClick={() => toggleSetting("push")}
            >
              <div className={styles.circle}></div>
            </div>
          </div>
          <div className={styles.option}>
            <div className={styles.label}>
              <FiUserPlus /> New Follows
            </div>
            <div
              className={`${styles.toggle} ${settings.follows ? styles.active : ""}`}
              onClick={() => toggleSetting("follows")}
            >
              <div className={styles.circle}></div>
            </div>
          </div>
          <div className={styles.option}>
            <div className={styles.label}>
              <FiHeart /> Likes
            </div>
            <div
              className={`${styles.toggle} ${settings.likes ? styles.active : ""}`}
              onClick={() => toggleSetting("likes")}
            >
              <div className={styles.circle}></div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationsSettings;