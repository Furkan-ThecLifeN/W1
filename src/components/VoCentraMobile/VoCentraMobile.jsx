import React, { useState, useEffect } from "react";
import styles from "./VoCentraMobile.module.css";
import ServerList from "../Vocentra/VocentraServerList/VocentraServerList";
import VoCentraRoster from "../Vocentra/VocentraRoster/VocentraRoster";
import { FaTimes } from "react-icons/fa"; 
import { SiHearthisdotat } from "react-icons/si";


const VoCentraMobile = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [showServerList, setShowServerList] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

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

  if (!isMobile) {
    return null; // Or you could return the regular Vocentra component here
  }

  return (
    <div className={styles.VoCentraMobile}>
      {/* Mobile Header with Server Toggle */}
      <div className={styles.mobileHeader}>
        <button className={styles.serverToggle} onClick={toggleServerList}>
          <SiHearthisdotat  size={24} />
        </button>
      </div>

      {/* Server List Overlay */}
      {showServerList && (
        <div className={styles.serverListOverlay}>
          <div className={styles.serverListContainer}>
            <button className={styles.closeButton} onClick={toggleServerList}>
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
