import React from 'react';
import styles from './ChannelSidebar.module.css';

const ChannelSidebar = ({ server, channels, voiceChannels }) => {
  return (
    <div className={styles.sidebar}>
      <div className={styles.serverHeader}>
        <div className={styles.serverName}>{server.name}</div>
        <button className={styles.serverDropdown}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="currentColor" d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
          </svg>
        </button>
      </div>

      <div className={styles.channelList}>
        <div className={styles.category}>
          <div className={styles.categoryHeader}>
            <svg width="16" height="16" viewBox="0 0 24 24" className={styles.categoryIcon}>
              <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
            </svg>
            <span>METİN KANALLARI</span>
          </div>
          <div className={styles.channels}>
            {channels.text.map(channel => (
              <div key={channel.id} className={`${styles.channel} ${channel.unread ? styles.unread : ''}`}>
                <span className={styles.channelPrefix}>#</span>
                {channel.name}
                {channel.unread && <div className={styles.unreadBadge} />}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.category}>
          <div className={styles.categoryHeader}>
            <svg width="16" height="16" viewBox="0 0 24 24" className={styles.categoryIcon}>
              <path fill="currentColor" d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
            </svg>
            <span>SES KANALLARI</span>
          </div>
          <div className={styles.channels}>
            {channels.voice.map(channel => (
              <div key={channel.id} className={styles.channel}>
                <span className={styles.channelPrefix}>
                  <svg width="12" height="12" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
                  </svg>
                </span>
                {channel.name}
                <span className={styles.voiceCount}>{channel.users}/{channel.maxUsers}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.userPanel}>
        <div className={styles.userInfo}>
          <div className={styles.avatar} style={{ backgroundImage: `url(${server.currentUser.avatar})` }} />
          <div className={styles.userDetails}>
            <div className={styles.username}>{server.currentUser.name}</div>
            <div className={styles.userTag}>#{server.currentUser.tag}</div>
          </div>
        </div>
        <div className={styles.userControls}>
          <button className={styles.controlButton}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
            </svg>
          </button>
          <button className={styles.controlButton}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19 14v3h3v2h-3v3h-2v-3h-3v-2h3v-3h2zm1.243-9.243c.586-.586.586-1.536 0-2.121l-1.378-1.378c-.586-.586-1.536-.586-2.121 0L12 6.939 9.243 4.243c-.586-.586-1.536-.586-2.121 0L5.743 5.621c-.586.586-.586 1.536 0 2.121L8.939 10l-2.196 2.196c-.586.586-.586 1.536 0 2.121l1.378 1.378c.586.586 1.536.586 2.121 0L12 13.061l2.757 2.757c.586.586 1.536.586 2.121 0l1.378-1.378c.586-.586.586-1.536 0-2.121L15.061 10l2.196-2.196z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChannelSidebar;