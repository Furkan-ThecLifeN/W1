import React, { useState, useRef } from "react";
import { FiPlus, FiX } from "react-icons/fi";
import { BsHash, BsHeadphones } from "react-icons/bs";
import { IoMdMicOff } from "react-icons/io";
import { MdHeadsetOff } from "react-icons/md";
import styles from "./MobileChannelSidebar.module.css";

const MobileChannelSidebar = ({ setActiveTextChannel, onClose }) => {
  const [activeChannelId, setActiveChannelId] = useState(null);
  const profilesRef = useRef(null);

  const profiles = Array(15)
    .fill(0)
    .map((_, i) => ({
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
    { id: 1, name: "welcome" },
    { id: 2, name: "general" },
    { id: 3, name: "announcements" },
    { id: 4, name: "rules" },
  ];

  const voiceChannels = [
    {
      id: 1,
      name: "General Voice",
      users: [
        { id: 1, name: "User1", muted: false, deafened: false },
        { id: 2, name: "User2", muted: true, deafened: false },
        { id: 3, name: "User3", muted: false, deafened: true },
      ],
    },
    {
      id: 2,
      name: "Gaming",
      users: [{ id: 4, name: "User4", muted: true, deafened: true }],
    },
  ];

  const scrollProfiles = (direction) => {
    if (profilesRef.current) {
      const scrollAmount = direction === "left" ? -100 : 100;
      profilesRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleTextChannelClick = (channel) => {
    setActiveChannelId(channel.id);
    if (typeof setActiveTextChannel === "function") {
      setActiveTextChannel(channel);
    }
    if (typeof onClose === "function") {
      onClose();
    }
  };

  return (
    <div className={styles.mobileSidebar}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.serverInfo}>
          <img
            src={server.currentUser.avatar}
            alt="Server"
            className={styles.serverAvatar}
          />
          <span className={styles.serverName}>{server.name}</span>
        </div>

        <button className={styles.closeButton} onClick={onClose}>
          <FiX />
        </button>
      </div>

      {/* Server Profiles Carousel */}
      <div className={styles.profilesSection}>
        <div className={styles.profilesContainer} ref={profilesRef}>
          {profiles.map((profile) => (
            <div key={profile.id} className={styles.profileWrapper}>
              <div
                className={`${styles.profile} ${
                  profile.active ? styles.activeProfile : ""
                }`}
              >
                <img
                  src={`https://i.pravatar.cc/150?img=${profile.id + 1}`}
                  alt={profile.name}
                  className={styles.profileImage}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Channel Content */}
      <div className={styles.contentArea}>
        {/* Text Channels */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>TEXT CHANNELS</span>
            <FiPlus className={styles.addIcon} />
          </div>
          <div className={styles.channelList}>
            {textChannels.map((channel) => (
              <div
                key={channel.id}
                className={`${styles.channelItem} ${
                  activeChannelId === channel.id ? styles.activeChannel : ""
                }`}
                onClick={() => handleTextChannelClick(channel)}
              >
                <BsHash className={styles.channelIcon} />
                <span>{channel.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Voice Channels */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>VOICE CHANNELS</span>
            <FiPlus className={styles.addIcon} />
          </div>
          <div className={styles.channelList}>
            {voiceChannels.map((channel) => (
              <div key={channel.id} className={styles.voiceChannel}>
                <div className={styles.voiceChannelHeader}>
                  <BsHeadphones className={styles.voiceChannelIcon} />
                  <span>{channel.name}</span>
                </div>
                <div className={styles.voiceUsers}>
                  {channel.users.map((user) => (
                    <div key={user.id} className={styles.voiceUser}>
                      <div className={styles.userInfo}>
                        <img
                          src={`https://i.pravatar.cc/150?img=${user.id + 20}`}
                          alt={user.name}
                          className={styles.userAvatar}
                        />
                        <span>{user.name}</span>
                      </div>
                      <div className={styles.userStatus}>
                        {user.muted && (
                          <IoMdMicOff className={styles.statusIcon} />
                        )}
                        {user.deafened && (
                          <MdHeadsetOff className={styles.statusIcon} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileChannelSidebar;
