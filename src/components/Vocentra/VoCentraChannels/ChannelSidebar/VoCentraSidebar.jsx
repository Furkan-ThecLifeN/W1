import React, { useState, useRef } from 'react';
import { FiChevronLeft, FiChevronRight, FiPlus } from 'react-icons/fi';
import { BsHash, BsHeadphones } from 'react-icons/bs';
import { IoMdMicOff } from 'react-icons/io';
import { MdHeadsetOff } from 'react-icons/md';
import styles from './VoCentraSidebar.module.css';

const ChannelSidebar = ({ setActiveTextChannel }) => {
  const [activeChannelId, setActiveChannelId] = useState(null);
  const [textChannelsOpen, setTextChannelsOpen] = useState(true);
  const [voiceChannelsOpen, setVoiceChannelsOpen] = useState(true);
  const profilesRef = useRef(null);

  const profiles = Array(15).fill(0).map((_, i) => ({
    id: i,
    name: `Server ${i + 1}`,
    active: i === 0,
  }));

  const server = {
    name: "Quantumtag Sunucu",
    currentUser: {
      name: "Furkan",
      tag: "1234",
      avatar: "https://i.pravatar.cc/150?img=3",
    },
  };

  const textChannels = [
    { id: 1, name: 'welcome' },
    { id: 2, name: 'general' },
    { id: 3, name: 'announcements' },
    { id: 4, name: 'rules' },
  ];

  const voiceChannels = [
    { 
      id: 1, 
      name: 'General Voice', 
      users: [
        { id: 1, name: 'User1', muted: false, deafened: false },
        { id: 2, name: 'User2', muted: true, deafened: false },
        { id: 3, name: 'User3', muted: false, deafened: true },
        { id: 4, name: 'User4', muted: true, deafened: true },
      ]
    },
    { 
      id: 2, 
      name: 'Gaming', 
      users: [
        { id: 5, name: 'User5', muted: false, deafened: false },
      ]
    },
  ];

  const scrollProfiles = (direction) => {
    if (profilesRef.current) {
      const scrollAmount = direction === 'left' ? -100 : 100;
      profilesRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleTextChannelClick = (channel) => {
    setActiveChannelId(channel.id);
    if (typeof setActiveTextChannel === 'function') {
      setActiveTextChannel(channel);
    }
  };

  return (
    <div className={styles.sidebar}>
      {/* Profiles Section */}
      <div className={styles.profilesSection}>
        <div className={styles.profilesHeaderSticky}>
          <div className={styles.profileServerInfo}>
            <img className={styles.serverAvatar} src={server.currentUser.avatar} alt="avatar" />
            <span className={styles.serverName}>{server.name}</span>
          </div>
          <div className={styles.scrollButtons}>
            <button onClick={() => scrollProfiles('left')} className={styles.scrollButton}>
              <FiChevronLeft />
            </button>
            <button onClick={() => scrollProfiles('right')} className={styles.scrollButton}>
              <FiChevronRight />
            </button>
          </div>
        </div>
        
        <div className={styles.profilesContainer} ref={profilesRef}>
          {profiles.map(profile => (
            <div key={profile.id} className={styles.profileWrapper}>
              <div className={`${styles.profile} ${profile.active ? styles.activeProfile : ''}`}>
                <div className={styles.profileImage}>
                  <img 
                    src={`https://i.pravatar.cc/150?img=${profile.id + 1}`} 
                    alt={profile.name} 
                  />
                  {profile.active && <div className={styles.activeIndicator}></div>}
                </div>
              </div>
              <div className={styles.profileTooltip}>{profile.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Text Channels Section */}
      <div className={styles.channelsSection}>
        <div 
          className={styles.channelsHeader} 
          onClick={() => setTextChannelsOpen(!textChannelsOpen)}
        >
          <span className={styles.headerText}>TEXT CHANNELS</span>
          <FiPlus className={styles.addIcon} />
        </div>
        
        {textChannelsOpen && (
          <div className={styles.channelsList}>
            {textChannels.map(channel => (
              <div 
                key={channel.id} 
                className={`${styles.channelItem} ${activeChannelId === channel.id ? styles.activeChannel : ''}`}
                onClick={() => handleTextChannelClick(channel)}
              >
                <BsHash className={styles.channelIcon} />
                <span>{channel.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Voice Channels Section */}
      <div className={styles.channelsSection}>
        <div 
          className={styles.channelsHeader} 
          onClick={() => setVoiceChannelsOpen(!voiceChannelsOpen)}
        >
          <span className={styles.headerText}>VOICE CHANNELS</span>
          <FiPlus className={styles.addIcon} />
        </div>
        
        {voiceChannelsOpen && (
          <div className={styles.channelsList}>
            {voiceChannels.map(channel => (
              <div key={channel.id} className={styles.voiceChannel}>
                <div className={styles.voiceChannelHeader}>
                  <BsHeadphones className={styles.voiceChannelIcon} />
                  <span>{channel.name}</span>
                </div>
                
                <div className={styles.voiceUsers}>
                  {channel.users.map(user => (
                    <div key={user.id} className={styles.voiceUser}>
                      <div className={styles.userInfo}>
                        <div className={styles.userAvatar}>
                          <img 
                            src={`https://i.pravatar.cc/150?img=${user.id + 20}`} 
                            alt={user.name} 
                          />
                        </div>
                        <span>{user.name}</span>
                      </div>
                      <div className={styles.userStatus}>
                        {user.muted && <IoMdMicOff className={styles.statusIconMuted} />}
                        {user.deafened && <MdHeadsetOff className={styles.statusIconDeafened} />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelSidebar;
