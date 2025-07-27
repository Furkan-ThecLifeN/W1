import React, { useState, useEffect } from 'react';
import ChannelsComponent from "../../components/VocentraChannels/ChannelsComponent";
import ChannelsComponentMobile from "../../components/VocentraChannels/ChannelsComponentMobile";
import Sidebar from '../../components/LeftSideBar/Sidebar';
import BottomNav from "../../components/BottomNav/BottomNav"; // BottomNav eklendi
import styles from "./VocentraServerPage.module.css";

const VocentraServerPage = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={styles.vocentraServer}>
      {!isMobile && <Sidebar />}
      <main className={styles.mainServerContent}>
        {isMobile ? <ChannelsComponentMobile /> : <ChannelsComponent />}
      </main>
      {isMobile && <BottomNav />} {/* Ekleme burada */}
    </div>
  );
};

export default VocentraServerPage;
