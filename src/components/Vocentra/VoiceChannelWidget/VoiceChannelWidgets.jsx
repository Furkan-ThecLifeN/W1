import React, { useState } from "react";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaHeadphones,
  FaHeadphonesAlt,
  FaCog,
  FaPhoneSlash,
  FaVideo,
  FaDesktop,
  FaVolumeUp,
  FaCheckCircle,
} from "react-icons/fa";
import { AiFillCaretDown } from "react-icons/ai";
import styles from "./VoiceChannelWidget.module.css";

const VoiceChannelWidget = ({
  userName = "Aylin Kaya",
  channelName = "Genel Sohbet",
  serverName = "Vocentra Sunucusu",
}) => {
  const [micMuted, setMicMuted] = useState(false);
  const [headphonesMuted, setHeadphonesMuted] = useState(false);
  const [connected, setConnected] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={`${styles.container} ${isCollapsed ? styles.collapsed : ""}`}
    >
      <div className={styles.header}>
        <div className={styles.userInfo}>
          <div className={styles.userAvatar} />
          <div>
            <div className={styles.userName}>{userName}</div>
            <div className={styles.userStatus}>Çevrimiçi</div>
          </div>
        </div>
        <div className={styles.controlButtons}>
          <button
            className={`${styles.iconButton} ${micMuted ? styles.muted : ""}`}
            onClick={() => setMicMuted(!micMuted)}
          >
            {micMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
          </button>
          <button
            className={`${styles.iconButton} ${
              headphonesMuted ? styles.muted : ""
            }`}
            onClick={() => setHeadphonesMuted(!headphonesMuted)}
          >
            {headphonesMuted ? <FaHeadphonesAlt /> : <FaHeadphones />}
          </button>
          <button className={styles.iconButton}>
            <FaCog />
          </button>
          <button
            className={styles.hiddenMiniButton}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <AiFillCaretDown />
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          <div className={styles.channelInfo}>
            <div className={styles.serverName}>{serverName}</div>
            <div className={styles.channelName}>
              <span className={styles.voiceIcon}>🔊</span>
              {channelName}
            </div>
          </div>

          <div
            className={`${styles.connectionStatus} ${
              connected ? styles.connected : ""
            }`}
          >
            <div className={styles.connectionText}>
              <FaCheckCircle />
              <span>Ses bağlantısı {connected ? "kuruldu" : "bekleniyor"}</span>
            </div>
            <button
              className={styles.disconnectButton}
              onClick={() => setConnected(!connected)}
            >
              <FaPhoneSlash />
            </button>
          </div>

          <div className={styles.actionButtons}>
            <button className={styles.actionButton}>
              <FaVideo />
              <span>Kamera</span>
            </button>
            <button className={styles.actionButton}>
              <FaDesktop />
              <span>Paylaş</span>
            </button>
            <button className={styles.actionButtonDisabled} disabled>
              <FaVolumeUp />
              <span>Ses</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default VoiceChannelWidget;
