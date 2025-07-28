// pages/VoCentraSettings.jsx
import React, { useState } from "react";
import styles from "./VoCentraSettings.module.css";
import SettingsSidebar from "./Settings/SettingsSidebar/SettingsSidebar";
import AccountSettings from "./Settings/AccountSettings/AccountSettings";
import ThemeSettings from "./Settings/ThemeSettings/ThemeSettings";
/* import AudioSettings from '../components/Settings/AudioSettings/AudioSettings';
import AppearanceSettings from '../components/Settings/AppearanceSettings/AppearanceSettings';
import NotificationSettings from '../components/Settings/NotificationSettings/NotificationSettings'; */

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
          {/*       {activeTab === 'audio' && <AudioSettings />}
          {activeTab === 'appearance' && <AppearanceSettings />}
          {activeTab === 'notifications' && <NotificationSettings />} */}
        </div>
      </div>
    </div>
  );
};

export default VoCentraSettings;
