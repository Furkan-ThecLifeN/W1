import React, { useState, useEffect } from "react";
import styles from "./VocentraPage.module.css";
import Sidebar from "../../components/LeftSideBar/Sidebar";
import Vocentra from "../../components/Vocentra/Vocentra";
import VocentraMobile from "../../components/VoCentraMobile/VoCentraMobile"; // Import the mobile component

const VoCentraPage = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    // Initial check
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener("resize", checkScreenSize);

    // Clean up the event listener
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <div className={styles.vocentraLayout}>
      {!isMobile && <Sidebar />}
      
      <main className={styles.mainContent}>
        {isMobile ? <VocentraMobile /> : <Vocentra />}
      </main>
    </div>
  );
};

export default VoCentraPage;