import React, { useEffect, useState } from 'react';
import styles from './ProfilePage.module.css';
import Sidebar from '../../components/LeftSideBar/Sidebar';
import AccountBox from '../../components/AccountPage/AccountBox/AccountBox';
import MobileProfile from '../../components/AccountPage/Mobile/MobileProfile';
import BottomNav from '../../components/BottomNav/BottomNav';

const ProfilePage = () => {
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
      {isMobile ? <MobileProfile /> : (
        <div className={styles.profilePage}>
          <Sidebar />
          <div className={styles.profilePage_box}>
            <AccountBox />
          </div>
        </div>
      )}
      {isMobile && <BottomNav />}
    </>
  );
};

export default ProfilePage;
