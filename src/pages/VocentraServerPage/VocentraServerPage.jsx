import React from 'react'
import Channels from '../../components/Vocentra/VocentraChannels/Channels';
import Sidebar from '../../components/LeftSideBar/Sidebar';
import styles from "./VocentraServerPage.module.css";



const VocentraServerPage = () => {
  return (
     <div className={styles.vocentraServer}>
      <Sidebar />
      <main className={styles.mainServerContent}>
      <Channels />
      </main>
    </div>
  )
}

export default VocentraServerPage