import React from 'react'
import VoCentraChannels from '../../components/VoCentra/VoCentraChannels/VoCentraChannels';
import Sidebar from '../../components/LeftSideBar/Sidebar';
import styles from "./VocentraServerPage.module.css";



const VocentraServerPage = () => {
  return (
     <div className={styles.vocentraServer}>
      <Sidebar />
      <main className={styles.mainServerContent}>
      <VoCentraChannels />
      </main>
    </div>
  )
}

export default VocentraServerPage