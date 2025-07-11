import React, { useState, useEffect } from "react";
import SavedPanel from "../../components/SavedPage/SavedPanel/SavedPanel";
import Sidebar from "../../components/LeftSideBar/Sidebar";
import ContentDisplay from "../../components/SavedPage/ContentDisplay/ContentDisplay";
import BottomToggleNav from "../../components/BottomToggleNav/BottomToggleNav";
import MobileSavedPage from "../../components/SavedPage/MobileSavedPage/MobileSavedPage"; 
import styles from "./SavedPage.module.css";

const SavedPage = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isMobile) {
  return (
    <>
      <MobileSavedPage />
      <BottomToggleNav />
    </>
  );
}

  return (
    <div className={styles.saved_container}>
      <Sidebar />
      <div className={styles.saved_box}>
        <SavedPanel />
        <ContentDisplay title="Box" />
      </div>
      <BottomToggleNav />
    </div>
  );
};

export default SavedPage;
