import React, { useState, useEffect } from "react";
import Sidebar from "../../components/LeftSideBar/Sidebar";
import BottomNav from "../../components/BottomNav/BottomNav";
import UserProfile from "../../components/UserProfile/UserProfile";
import MobileUserProfile from "../../components/UserProfile/Mobile/MobileUserProfile"; // Add MobileUserProfile
import styles from "./UserProfilePage.module.css";
import Footer from "../../components/Footer/Footer";

const UserProfilePage = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {isMobile ? (
        <div className={styles.mobileWrapper}>
          <MobileUserProfile />
        </div>
      ) : (
        <div className={styles.userProfilePage}>
          <Sidebar />
          <section className={styles.profileSection}>
            <UserProfile />
          </section>
        </div>
      )}
      {isMobile && <BottomNav />}
    </>
  );
};

export default UserProfilePage;
