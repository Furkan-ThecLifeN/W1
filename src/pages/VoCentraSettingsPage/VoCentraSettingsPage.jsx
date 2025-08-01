import React from 'react';
import Sidebar from '../../components/LeftSideBar/Sidebar';
import VoCentraSettings from '../../components/VoCentraSettings/VoCentraSettings';
import BottomNav from '../../components/BottomNav/BottomNav';
import styles from './VoCentraSettingsPage.module.css';

const VoCentraSettingsPage = () => {
  return (
    <div className={styles.settingsPage}>
      <Sidebar />
      <main className={styles.mainContent}>
        <VoCentraSettings />
      </main>
      <BottomNav /> {/* Burada ekledik */}
    </div>
  );
};

export default VoCentraSettingsPage;
