import React, { useEffect, useState } from "react";
import Sidebar from "../../components/LeftSideBar/Sidebar";
import AccountBox from "../../components/AccountPage/AccountBox/AccountBox";
import MobileProfile from "../../components/AccountPage/Mobile/MobileProfile";
import BottomNav from "../../components/BottomNav/BottomNav";
import { useProfileStore } from "../../Store/useProfileStore";
import axios from "axios";
import PublicAccessWrapper from "../../components/PublicAccessWrapper/PublicAccessWrapper";
import Footer from "../../components/Footer/Footer"; // ✅ Footer import edildi

import styles from "./ProfilePage.module.css";

const ProfilePage = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const { profileData, isLoaded, loading, setState } = useProfileStore();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isLoaded) return;

    const fetchProfile = async () => {
      try {
        setState({ loading: true });
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/users/me`
        );
        setState({ profileData: res.data, isLoaded: true, loading: false });
      } catch (err) {
        console.error("Profil yüklenirken hata:", err);
        setState({ loading: false });
      }
    };
    fetchProfile();
  }, [isLoaded, setState]);

  return (
    <PublicAccessWrapper loginMessage="Profilinizi görmek için giriş yapın.">
      {isMobile ? (
        <>
          <MobileProfile data={profileData} />
          <BottomNav />
          <Footer /> {/* ✅ Mobil görünümde de footer görünsün */}
        </>
      ) : (
        <div className={styles.profilePage}>
          <Sidebar />
          <div className={styles.profilePage_box}>
            {loading && !isLoaded ? (
              <p>Yükleniyor...</p>
            ) : (
              <AccountBox data={profileData} />
            )}
            <Footer /> 
          </div>
        </div>
      )}
    </PublicAccessWrapper>
  );
};

export default ProfilePage;
