// pages/VoCentraSettings.jsx
import React, { useState } from "react";
import styles from "./VoCentraSettings.module.css";
import SettingsSidebar from "./Settings/SettingsSidebar/SettingsSidebar";
import ThemeSettings from "./Settings/ThemeSettings/ThemeSettings";
import NotificationSettings from "./Settings/NotificationSettings/NotificationSettings";
import KeyboardShortcuts from './Settings/KeyboardShortcuts/KeyboardShortcuts';

const VoCentraSettings = () => {
  const [activeTab, setActiveTab] = useState("account");

  return (
    <div className={styles.settingsContainer}>
      <div className={styles.settingsHeader}>
        <h1 className={styles.settingsTitle}>VoCentra</h1>
      </div>

      <div className={styles.settingsContent}>
        <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className={styles.settingsMain}>
          {activeTab === "theme" && <ThemeSettings />}
          {activeTab === "notifications" && <NotificationSettings />}
          {activeTab === "keybinds" && <KeyboardShortcuts />}
        </div>
      </div>
    </div>
  );
};

export default VoCentraSettings;
