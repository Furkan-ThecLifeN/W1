import React, { useState, useEffect } from "react";
import styles from "./VocentraPage.module.css";

// Components
import Sidebar from "../../components/LeftSideBar/Sidebar"; // Genel App Menüsü
import BottomNav from "../../components/BottomNav/BottomNav"; // Mobil Menü
import Vocentra from "../../components/Voice/Vocentra"; // Yeni Ana İçerik

const VoCentraPage = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={styles.pageLayout}>
      
      {/* Desktop: Sol Ana Menü */}
      {!isMobile && (
        <aside className={styles.appSidebar}>
          <Sidebar />
        </aside>
      )}

      {/* Ana İçerik Alanı (Server List + Chat + Roster) */}
      <main className={styles.mainStage}>
        <Vocentra />
      </main>

      {/* Mobile: Alt Menü */}
      {isMobile && (
        <div className={styles.mobileNavWrapper}>
          <BottomNav />
        </div>
      )}
      
    </div>
  );
};

export default VoCentraPage;