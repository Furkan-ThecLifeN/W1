// pages/VoCentraSettings.jsx
import React, { useState } from "react";
import styles from "./VoCentraSettings.module.css";
import SettingsSidebar from "./Settings/SettingsSidebar/SettingsSidebar";
import ThemeSettings from "./Settings/ThemeSettings/ThemeSettings";
import NotificationSettings from "./Settings/NotificationSettings/NotificationSettings";
import StatusActivity from "./Settings/StatusActivity/StatusActivity";
import SoundSettings from "./Settings/SoundSettings/SoundSettings";
import CameraSettings from "./Settings/CameraSettings/CameraSettings";
import AudioActivityView from "./Settings/AudioActivityView/AudioActivityView";
import GameActivityStatus from "./Settings/GameActivityStatus/GameActivityStatus";
import IntegrationSettings from "./Settings/IntegrationSettings/IntegrationSettings";
import LiveStreamSettings from "./Settings/LiveStreamSettings/LiveStreamSettings";

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
          {activeTab === "statusSettings" && <StatusActivity />}
          {activeTab === "audio" && <SoundSettings />}
          {activeTab === "video" && <CameraSettings />}
          {activeTab === "voiceActivity" && <AudioActivityView />}
          {activeTab === "richPresence" && <GameActivityStatus />}
          {activeTab === "nowPlaying" && <IntegrationSettings />}
          {activeTab === "liveStream" && <LiveStreamSettings />}
        </div>
      </div>
    </div>
  );
};

export default VoCentraSettings;
