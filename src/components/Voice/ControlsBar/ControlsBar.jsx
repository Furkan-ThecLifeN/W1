import React from 'react';
import { Mic, MicOff, Monitor, MonitorOff, PhoneOff, MessageSquare } from 'lucide-react';
import { useRTC } from '../../../context/RTCContext';
import styles from './ControlsBar.module.css';

const ControlsBar = ({ toggleChat, isChatOpen }) => {
  const { isMicOn, toggleMic, isScreenSharing, toggleScreenShare } = useRTC();

  return (
    <div className={styles.bar}>
      
      {/* Mikrofon Kontrolü */}
      <button 
        onClick={toggleMic}
        className={`${styles.button} ${!isMicOn ? styles.micOff : ''}`}
      >
        {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
      </button>

      {/* Ekran Paylaşımı */}
      <button 
        onClick={toggleScreenShare}
        className={`${styles.button} ${isScreenSharing ? styles.activeScreen : ''}`}
      >
        {isScreenSharing ? <MonitorOff size={24} /> : <Monitor size={24} />}
      </button>

      {/* Chat Aç/Kapa */}
      <button 
        onClick={toggleChat}
        className={`${styles.button} ${isChatOpen ? styles.activeChat : ''}`}
      >
        <MessageSquare size={24} />
      </button>

      {/* Ayrıl Butonu */}
      <button className={`${styles.button} ${styles.hangUp}`}>
        <PhoneOff size={24} />
      </button>
    </div>
  );
};

export default ControlsBar;