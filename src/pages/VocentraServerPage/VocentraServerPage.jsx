import React from 'react'
import ChannelsComponent from "../../components/VocentraChannels/ChannelsComponent"
import Sidebar from '../../components/LeftSideBar/Sidebar';
import styles from "./VocentraServerPage.module.css";



const VocentraServerPage = () => {
  return (
     <div className={styles.vocentraServer}>
      <Sidebar />
      <main className={styles.mainServerContent}>
      <ChannelsComponent />
      </main>
    </div>
  )
}

export default VocentraServerPage