import React, { useState, useEffect } from "react";
import styles from "./VoCentraMobile.module.css";
import ServerList from "../Vocentra/VocentraServerList/VocentraServerList";
import VoCentraRoster from "../Vocentra/VocentraRoster/VocentraRoster";
import { FaTimes } from "react-icons/fa";
import { SiHearthisdotat } from "react-icons/si";
import { FiSettings } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const VoCentraMobile = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [showServerList, setShowServerList] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleServerList = () => {
    setShowServerList(!showServerList);
  };

  const handleSettingsClick = () => {
    navigate("/vosettings"); 
  };

  if (!isMobile) {
    return null; 
  }

  return (
    <div className={styles.VocentraMobile}>
      <div className={styles.mobileHeader}>
        <button className={styles.serverToggle} onClick={toggleServerList} aria-label="Sunucu Listesi">
          <SiHearthisdotat size={24} />
        </button>

        <button className={styles.settingsButton} onClick={handleSettingsClick} aria-label="Ayarlar">
          <FiSettings size={24} />
        </button>
      </div>

      {/* Server List Overlay */}
      {showServerList && (
        <div className={styles.serverListOverlay}>
          <div className={styles.serverListContainer}>
            <button className={styles.closeButton} onClick={toggleServerList} aria-label="Kapat">
              <FaTimes size={18} />
            </button>
            <ServerList onSelectUser={setSelectedUser} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={styles.Vocentra_main}>
        <VoCentraRoster />
      </div>
    </div>
  );
};

export default VoCentraMobile;
