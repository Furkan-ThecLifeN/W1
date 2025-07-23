import React from 'react'
import VocentraChannels from '../../components/Vocentra/VocentraChannels/ChannelsComponent';
import Sidebar from '../../components/LeftSideBar/Sidebar';
import styles from "./VocentraServerPage.module.css";



const VocentraServerPage = () => {
  return (
     <div className={styles.vocentraServer}>
      <Sidebar />
      <main className={styles.mainServerContent}>
      <VocentraChannels />
      </main>
    </div>
  )
}

export default VocentraServerPage