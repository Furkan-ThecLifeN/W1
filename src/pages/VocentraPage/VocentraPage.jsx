import React, { useState, useEffect } from "react";
import styles from "./VocentraPage.module.css";
import Sidebar from "../../components/LeftSideBar/Sidebar";
import Vocentra from "../../components/Vocentra/Vocentra";
import VocentraMobile from "../../components/VoCentraMobile/VoCentraMobile";
import BottomNav from "../../components/BottomNav/BottomNav"; // BottomNav eklendi

const VoCentraPage = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <div className={styles.vocentraLayout}>
      {!isMobile && <Sidebar />}
      <main className={styles.mainContent}>
        {isMobile ? <VocentraMobile /> : <Vocentra />}
      </main>
      {isMobile && <BottomNav />} 
    </div>
  );
};

export default VoCentraPage;
