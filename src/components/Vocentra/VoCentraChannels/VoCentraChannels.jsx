import React from 'react';
import styles from './VoCentraChannels.module.css';
import ChannelSidebar from './ChannelSidebar';
import ChatArea from './ChatArea';

const VoCentraChannels = ({ server, channels, currentChannel, messages }) => {
  return (
    <div className={styles.discordLayout}>
      <div className={styles.sidebarContainer}>
        <ChannelSidebar server={server} channels={channels} />
      </div>
      
      <div className={styles.chatContainer}>
        <ChatArea channel={currentChannel} messages={messages} />
      </div>
    </div>
  );
};

export default VoCentraChannels;