import React, { useState } from "react";
import styles from "./NotificationsSettings.module.css";
import { FiBell, FiMail, FiHeart, FiUserPlus, FiSmartphone } from "react-icons/fi";

const NotificationsSettings = () => {
  const [settings, setSettings] = useState({
    email: true,
    push: false,
    follows: true,
    likes: true,
  });

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}><FiBell /> Notification Settings</h2>
      <p className={styles.subtext}>Manage how you receive alerts and notifications.</p>

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
          <FiSmartphone /> App Push Notifications
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
          <FiUserPlus /> New Follower Alerts
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
          <FiHeart /> Likes & Comments
        </div>
        <div
          className={`${styles.toggle} ${settings.likes ? styles.active : ""}`}
          onClick={() => toggleSetting("likes")}
        >
          <div className={styles.circle}></div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsSettings;
