import React, { useEffect, useState } from "react";
import styles from "./ProfilePage.module.css";
import Sidebar from "../../components/LeftSideBar/Sidebar";
import AccountBox from "../../components/AccountPage/AccountBox/AccountBox";
import MobileProfile from "../../components/AccountPage/Mobile/MobileProfile";
import BottomNav from "../../components/BottomNav/BottomNav";
import { useProfileStore } from "../../Store/useProfileStore";
import axios from "axios";

const ProfilePage = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const { profileData, isLoaded, loading, setState } = useProfileStore();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isLoaded) return; // 👈 daha önce yüklendiyse tekrar fetch etme
    const fetchProfile = async () => {
      try {
        setState({ loading: true });
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/me`);
        setState({ profileData: res.data, isLoaded: true, loading: false });
      } catch (err) {
        console.error("Profil yüklenirken hata:", err);
        setState({ loading: false });
      }
    };
    fetchProfile();
  }, [isLoaded, setState]);

  if (isMobile) {
    return (
      <>
        <MobileProfile data={profileData} />
        <BottomNav />
      </>
    );
  }

  return (
    <div className={styles.profilePage}>
      <Sidebar />
      <div className={styles.profilePage_box}>
        {loading && !isLoaded ? <p>Yükleniyor...</p> : <AccountBox data={profileData} />}
      </div>
    </div>
  );
};

export default ProfilePage;
