import React from 'react';
import styles from "./ProfilePage.module.css"
import Sidebar from '../../components/LeftSideBar/Sidebar';

const ProfilePage = () => {
  return (
    <div className={styles.profilePage}>
      <Sidebar />
    </div>
  )
}

export default ProfilePage