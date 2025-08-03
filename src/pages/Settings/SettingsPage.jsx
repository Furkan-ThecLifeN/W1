import React, { useState, useEffect } from "react";
import SettingsScreen from "../../components/Settings/SettingsScreen/SettingsScreen";
import styles from "./SettingsPage.module.css";
import Sidebar from "../../components/LeftSideBar/Sidebar";
import MobileSettings from "../../components/Settings/MobileSettings/MobileSettings";
import BottomNav from "../../components/BottomNav/BottomNav";

// ChartSetup.js veya App.js gibi bir yerde
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);


const SettingsPage = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={styles.settingsWrapper}>
      {isMobile ? (
        <>
        <MobileSettings />
         <BottomNav /></>
      ) : (
        <>
          <Sidebar />
          <SettingsScreen />
          <BottomNav />
        </>
      )}
    </div>
  );
};

export default SettingsPage;
