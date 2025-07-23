import React from "react";
import styles from "./VocentraServerList.module.css";
import { MdVolumeOff } from "react-icons/md";
import { FaWaveSquare } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const dummyServers = [
  {
    id: 1,
    name: "Fynex Nexus",
    profileImage: "https://i.pinimg.com/736x/c3/87/37/c38737919bf32817c0aa2c0093501f56.jpg",
    isMuted: false,
    hasVoiceUsers: true,
    activeUsers: 3,
  },
  {
    id: 2,
    name: "Cyber Core",
    profileImage: "https://i.pinimg.com/736x/c3/87/37/c38737919bf32817c0aa2c0093501f56.jpg",
    isMuted: true,
    hasVoiceUsers: false,
    activeUsers: 0,
  },
  {
    id: 3,
    name: "AI Matrix",
    profileImage: "https://i.pinimg.com/736x/c3/87/37/c38737919bf32817c0aa2c0093501f56.jpg",
    isMuted: false,
    hasVoiceUsers: false,
    activeUsers: 0,
  },
  {
    id: 4,
    name: "Quantum Realm",
    profileImage: "https://i.pinimg.com/736x/c3/87/37/c38737919bf32817c0aa2c0093501f56.jpg",
    isMuted: false,
    hasVoiceUsers: true,
    activeUsers: 5,
  },
  {
    id: 5,
    name: "Neon Hub",
    profileImage: "https://i.pinimg.com/736x/c3/87/37/c38737919bf32817c0aa2c0093501f56.jpg",
    isMuted: true,
    hasVoiceUsers: false,
    activeUsers: 0,
  },
  {
    id: 6,
    name: "Nova Circuit",
    profileImage: "https://i.pinimg.com/736x/c3/87/37/c38737919bf32817c0aa2c0093501f56.jpg",
    isMuted: false,
    hasVoiceUsers: true,
    activeUsers: 2,
  },
  {
    id: 7,
    name: "Echo Syndicate",
    profileImage: "https://i.pinimg.com/736x/c3/87/37/c38737919bf32817c0aa2c0093501f56.jpg",
    isMuted: false,
    hasVoiceUsers: false,
    activeUsers: 0,
  },
  {
    id: 8,
    name: "Synapse Protocol",
    profileImage: "https://i.pinimg.com/736x/c3/87/37/c38737919bf32817c0aa2c0093501f56.jpg",
    isMuted: true,
    hasVoiceUsers: false,
    activeUsers: 0,
  },
  {
    id: 9,
    name: "Digital Hollow",
    profileImage: "https://i.pinimg.com/736x/c3/87/37/c38737919bf32817c0aa2c0093501f56.jpg",
    isMuted: false,
    hasVoiceUsers: true,
    activeUsers: 4,
  },
  {
    id: 10,
    name: "Crimson Orbit",
    profileImage: "https://i.pinimg.com/736x/c3/87/37/c38737919bf32817c0aa2c0093501f56.jpg",
    isMuted: false,
    hasVoiceUsers: false,
    activeUsers: 0,
  },
  {
    id: 11,
    name: "Void Enclave",
    profileImage: "https://i.pinimg.com/736x/c3/87/37/c38737919bf32817c0aa2c0093501f56.jpg",
    isMuted: true,
    hasVoiceUsers: false,
    activeUsers: 0,
  },
  {
    id: 12,
    name: "Stellar Grid",
    profileImage: "https://i.pinimg.com/736x/c3/87/37/c38737919bf32817c0aa2c0093501f56.jpg",
    isMuted: false,
    hasVoiceUsers: true,
    activeUsers: 1,
  },
  {
    id: 13,
    name: "Orbital Spire",
    profileImage: "https://i.pinimg.com/736x/c3/87/37/c38737919bf32817c0aa2c0093501f56.jpg",
    isMuted: false,
    hasVoiceUsers: false,
    activeUsers: 0,
  },
  {
    id: 14,
    name: "Eclipse Sector",
    profileImage: "https://i.pinimg.com/736x/c3/87/37/c38737919bf32817c0aa2c0093501f56.jpg",
    isMuted: true,
    hasVoiceUsers: false,
    activeUsers: 0,
  },
  {
    id: 15,
    name: "Flux Horizon",
    profileImage: "https://i.pinimg.com/736x/c3/87/37/c38737919bf32817c0aa2c0093501f56.jpg",
    isMuted: false,
    hasVoiceUsers: true,
    activeUsers: 6,
  },
];


const VocentraServerList = () => {
  const navigate = useNavigate();

  const handleSelectServer = (server) => {
    const formattedName = server.name.toLowerCase().replace(/\s+/g, "-"); // örnek: "Fynex Nexus" → "fynex-nexus"
    navigate(`/server/${formattedName}`);
  };

  return (
    <div className={styles.container}>
      <ul className={styles.list}>
        {dummyServers.map((server) => (
          <li
            key={server.id}
            className={styles.card}
            onClick={() => handleSelectServer(server)}
            title={server.name}
          >
            <img
              src={server.profileImage}
              alt={server.name}
              className={styles.avatar}
              width={40}
              height={40}
            />
            <span className={styles.name}>{server.name}</span>

            {server.hasVoiceUsers && (
              <div className={styles.voiceInfo}>
                <span className={styles.waveIcon}>W</span>
                <span className={styles.userCount}>+{server.activeUsers}</span>
              </div>
            )}

            {server.isMuted && (
              <span className={styles.statusIcon}>
                <MdVolumeOff title="Sunucu sessize alındı" />
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VocentraServerList;

