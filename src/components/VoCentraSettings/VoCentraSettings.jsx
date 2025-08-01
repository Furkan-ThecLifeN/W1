import React, { useState, useEffect } from "react";
import styles from "./VoCentraSettings.module.css";
import SettingsSidebar from "./Settings/SettingsSidebar/SettingsSidebar";
import ThemeSettings from "./Settings/ThemeSettings/ThemeSettings";
import NotificationSettings from "./Settings/NotificationSettings/NotificationSettings";
import StatusActivity from "./Settings/StatusActivity/StatusActivity";
import SoundSettings from "./Settings/SoundSettings/SoundSettings";
import CameraSettings from "./Settings/CameraSettings/CameraSettings";
import AudioActivityView from "./Settings/AudioActivityView/AudioActivityView";
import GameActivityStatus from "./Settings/GameActivityStatus/GameActivityStatus";
import ConnectionsSettings from "./Settings/ConnectionsSettings/ConnectionsSettings";
import LiveStreamSettings from "./Settings/LiveStreamSettings/LiveStreamSettings";
import ScreenShareSettings from "./Settings/ScreenShareSettings/ScreenShareSettings";
import ServersSettings from "./Settings/ServersSettings/ServersSettings";
import ModerationSettings from "./Settings/ModerationSettings/ModerationSettings";
import IntegrationsSettings from "./Settings/IntegrationsSettings/IntegrationsSettings";
import { FiMenu, FiSettings } from "react-icons/fi";

const VoCentraSettings = () => {
  const [activeTab, setActiveTab] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className={styles.settingsContainer}>
      {isMobile && (
        <button className={styles.mobileMenuButton} onClick={toggleSidebar}>
          <FiMenu size={24} />
        </button>
      )}

      {isMobile && sidebarOpen && (
        <div
          className={`${styles.sidebarOverlay} ${sidebarOpen ? "open" : ""}`}
          onClick={toggleSidebar}
        />
      )}

      <div className={styles.settingsContent}>
        <div
          className={`${styles.sidebarContainer} ${
            sidebarOpen ? styles.sidebarOpen : ""
          }`}
        >
          <SettingsSidebar
            activeTab={activeTab}
            setActiveTab={handleTabChange}
          />
        </div>

        <div className={styles.settingsMain}>
          {activeTab ? (
            <>
              {activeTab === "theme" && <ThemeSettings />}
              {activeTab === "notifications" && <NotificationSettings />}
              {activeTab === "statusSettings" && <StatusActivity />}
              {activeTab === "audio" && <SoundSettings />}
              {activeTab === "video" && <CameraSettings />}
              {activeTab === "voiceActivity" && <AudioActivityView />}
              {activeTab === "richPresence" && <GameActivityStatus />}
              {activeTab === "nowPlaying" && <ConnectionsSettings />}
              {activeTab === "liveStream" && <LiveStreamSettings />}
              {activeTab === "screenShare" && <ScreenShareSettings />}
              {activeTab === "serverManagement" && <ServersSettings />}
              {activeTab === "moderation" && <ModerationSettings />}
              {activeTab === "integrations" && <IntegrationsSettings />}
            </>
          ) : (
            <div className={styles.defaultView}>
              <FiSettings size={64} className={styles.defaultIcon} />
              <h2>VoCentra Ayarlarına Hoş Geldiniz</h2>
              <p>Soldaki menüden ayar kategorisini seçerek başlayın</p>
              {isMobile && (
                <button
                  className={styles.openMenuButton}
                  onClick={toggleSidebar}
                >
                  Menüyü Aç
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoCentraSettings;
