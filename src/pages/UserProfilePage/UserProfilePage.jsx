import React from "react";
import Sidebar from "../../components/LeftSideBar/Sidebar";
import BottomNav from "../../components/BottomNav/BottomNav";
import UserProfile from "../../components/UserProfile/UserProfile";
import styles from "./UserProfilePage.module.css";

const UserProfilePage = () => {
  return (
    <div className={styles.userProfilePage}>
      <Sidebar />
      <section className={styles.profileSection}>
        <UserProfile />
      </section>
      <BottomNav />
    </div>
  );
};

export default UserProfilePage;
