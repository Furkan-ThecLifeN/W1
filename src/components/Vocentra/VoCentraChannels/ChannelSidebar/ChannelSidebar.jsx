import React, { useState } from 'react';
import styles from './ChannelSidebar.module.css';

const ChannelSidebar = ({ server, channels, onChannelSelect }) => {
  const [expandedCategories, setExpandedCategories] = useState({
    text: true,
    voice: true
  });

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  return (
    <div className={styles.sidebar}>
      {/* Server Header */}
      <div className={styles.serverHeader}>
        <div className={styles.serverIcon}>
          {server.name.charAt(0).toUpperCase()}
        </div>
        <div className={styles.serverInfo}>
          <div className={styles.serverName}>{server.name}</div>
          <div className={styles.serverStatus}>Çevrimiçi</div>
        </div>
      </div>

      {/* Text Channels Section */}
      <div className={styles.category}>
        <div 
          className={styles.categoryHeader}
          onClick={() => toggleCategory('text')}
        >
          <div className={styles.categoryTitle}>
            <span className={styles.categoryIcon}>
              {expandedCategories.text ? '▼' : '▶'}
            </span>
            <span>METİN KANALLARI</span>
          </div>
        </div>

        {expandedCategories.text && (
          <div className={styles.channelList}>
            {channels.text.map(channel => (
              <div 
                key={`text-${channel.id}`}
                className={`${styles.channelItem} ${channel.unread ? styles.unread : ''}`}
                onClick={() => onChannelSelect && onChannelSelect(channel)}
              >
                <span className={styles.channelType}>#</span>
                <span className={styles.channelName}>{channel.name}</span>
                {channel.unread && <div className={styles.unreadIndicator} />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Voice Channels Section */}
      <div className={styles.category}>
        <div 
          className={styles.categoryHeader}
          onClick={() => toggleCategory('voice')}
        >
          <div className={styles.categoryTitle}>
            <span className={styles.categoryIcon}>
              {expandedCategories.voice ? '▼' : '▶'}
            </span>
            <span>SES KANALLARI</span>
          </div>
        </div>

        {expandedCategories.voice && (
          <div className={styles.channelList}>
            {channels.voice.map(channel => (
              <div 
                key={`voice-${channel.id}`}
                className={styles.channelItem}
                onClick={() => onChannelSelect && onChannelSelect(channel)}
              >
                <span className={styles.channelType}>♪</span>
                <span className={styles.channelName}>{channel.name}</span>
                <div className={styles.userCountBadge}>
                  {channel.users}/{channel.maxUsers}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Channel Button */}
      <div className={styles.createChannel}>
        <button className={styles.createButton}>
          <span>+</span> Kanal Oluştur
        </button>
      </div>
    </div>
  );
};

export default ChannelSidebar;