import React from 'react';
import styles from './ProfilePage.module.css';
import Sidebar from '../../components/LeftSideBar/Sidebar';
import AccountBox from '../../components/AccountPage/AccountBox/AccountBox';

const ProfilePage = () => {
  return (
    <div className={styles.profilePage}>
      <Sidebar />
      <div className={styles.profilePage_box}>
        <AccountBox />
      </div>
    </div>
  );
};

export default ProfilePage;
