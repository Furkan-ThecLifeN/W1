import React, { useState, useEffect } from "react";
import {
  FaChevronDown,
  FaHashtag,
  FaVolumeUp,
  FaCog,
  FaMicrophone,
  FaHeadphones,
  FaPhoneSlash,
  FaMicrophoneSlash,
  FaLock,
} from "react-icons/fa";
import { MdScreenShare } from "react-icons/md";
import { useUserStore } from "../../../Store/useUserStore";
import { useServerStore } from "../../../Store/useServerStore";
import styles from "./ChannelSidebar.module.css";
import { useWebRTC } from "../../../hooks/useWebRTC";

// --- MODALLAR ---
import VoiceUserCard from "../Modals/VoiceUserCard/VoiceUserCard";
import SettingsModal from "../Modals/SettingsModal/SettingsModal";
import VoiceRoomSettingsModal from "../Modals/VoiceRoomSettingsModal/VoiceRoomSettingsModal";
import CreateChannelModal from "../Modals/CreateChannelModal/CreateChannelModal";
import AddButton from "../Modals/AddButton/AddButton";
import TextChannelSettingsModal from "../Modals/TextChannelSettingsModal/TextChannelSettingsModal";
import SwitchVoiceModal from "../Modals/SwitchVoiceModal/SwitchVoiceModal";

const ChannelSidebar = ({
  serverInfo,
  textChannels = [],
  voiceChannels = [],
  activeChannelId,
  onChannelSelect,
  socket,
}) => {
  // --- STATE ---
  const [collapsed, setCollapsed] = useState({ text: false, voice: false });
  const [voiceStates, setVoiceStates] = useState({});
  const [localChannels, setLocalChannels] = useState([]);
  const [socketReady, setSocketReady] = useState(false);
  const [userStatuses, setUserStatuses] = useState({});
  const [localStatus, setLocalStatus] = useState({ muted: false, deaf: false });

  // Modallar
  const [showSettings, setShowSettings] = useState(false);
  const [showVoiceRoomSettings, setShowVoiceRoomSettings] = useState(false);
  const [showTextChannelSettings, setShowTextChannelSettings] = useState(false);
  const [selectedVoiceRoom, setSelectedVoiceRoom] = useState(null);
  const [selectedTextChannel, setSelectedTextChannel] = useState(null);
  const [createModal, setCreateModal] = useState({ show: false, type: "text" });
  
  // Oda Değiştirme Kontrolü
  const [switchModal, setSwitchModal] = useState({ show: false, targetChannel: null });

  const currentServerId = serverInfo?.id || serverInfo?.firebaseServerId;
  const { currentUser, fetchCurrentUser } = useUserStore();
  const { updateServerChannel } = useServerStore();

  const {
    joinVoiceChannel,
    leaveVoiceChannel,
    activeVoiceChannel,
    localStream,
    remoteStreams,
    toggleMic,
    toggleDeaf,
    inputDevices,
    outputDevices,
    selectedMic,
    selectedSpeaker,
    switchMicrophone,
    switchSpeaker,
  } = useWebRTC(socket, currentUser);

  const canManageChannels =
    serverInfo?.permissions?.includes("ADMIN") ||
    serverInfo?.permissions?.includes("MANAGE_CHANNELS");

  // 1. Kullanıcı Bilgilerini Al
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // 2. Kanal Sync
  useEffect(() => {
    if (!serverInfo) return;
    let incoming = [];
    if (Array.isArray(serverInfo.channels) && serverInfo.channels.length > 0) {
      incoming = serverInfo.channels;
    } else {
      incoming = [
        ...textChannels.map((c) => ({ ...c, type: "text" })),
        ...voiceChannels.map((c) => ({ ...c, type: "voice" })),
      ];
    }

    setLocalChannels((prev) => {
      const channelMap = new Map();
      prev.forEach((c) => {
        const id = c.channelId || c.id;
        if (id) channelMap.set(id, c);
      });
      incoming.forEach((c) => {
        const id = c.channelId || c.id;
        if (id) {
          const existing = channelMap.get(id);
          channelMap.set(id, { ...existing, ...c });
        }
      });
      return Array.from(channelMap.values());
    });
  }, [currentServerId, serverInfo, textChannels, voiceChannels]);

  // 3. Socket Listeners
  useEffect(() => {
    if (!socket) return;

    const handleMsg = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === "AUTH_OK") {
          setSocketReady(true);
          return;
        }

        if (msg.type === "CHANNEL_LIFECYCLE_UPDATE") {
          const { action, channel, serverId } = msg;
          if (serverId && serverId !== currentServerId) return;
          const id = channel.channelId || channel.id;
          if (!id) return;

          if (action === "updated") updateServerChannel(currentServerId, channel);

          setLocalChannels((prev) => {
            if (action === "created") {
              if (prev.some((c) => (c.channelId || c.id) === id)) return prev;
              return [...prev, channel];
            }
            if (action === "deleted") return prev.filter((c) => (c.channelId || c.id) !== id);
            if (action === "updated") {
              return prev.map((c) => (c.channelId || c.id) === id ? { ...c, ...channel } : c);
            }
            return prev;
          });
        }

        if (msg.type === "VOICE_STATE_UPDATE") {
          const { channelId, userId, action } = msg;
          const k = channelId || msg.id;
          if (!k || !userId || !action) return;

          setVoiceStates((prev) => {
            const current = prev[k] || [];
            if (action === "joined") {
              const newState = { ...prev };
              Object.keys(newState).forEach(key => {
                newState[key] = newState[key].filter(u => u !== userId);
              });
              newState[k] = [...(newState[k] || []), userId];
              return newState;
            }
            if (action === "left") {
              return { ...prev, [k]: current.filter((uid) => uid !== userId) };
            }
            return prev;
          });
        }

        if (msg.type === "USER_STATUS_UPDATE") {
          setUserStatuses((prev) => ({
            ...prev,
            [msg.userId]: { muted: msg.muted, deaf: msg.deaf },
          }));
        }
      } catch (err) {
        console.error("Socket Error:", err);
      }
    };

    socket.addEventListener("message", handleMsg);
    return () => socket.removeEventListener("message", handleMsg);
  }, [socket, currentServerId, updateServerChannel]);

  // --- ACTIONS ---
  const handleToggleMute = () => {
    if (localStatus.deaf) return; 
    const newMuted = !localStatus.muted;
    setLocalStatus((p) => ({ ...p, muted: newMuted }));
    toggleMic(newMuted);
    broadcastStatus({ muted: newMuted, deaf: localStatus.deaf });
  };

  const handleToggleDeaf = () => {
    const newDeaf = !localStatus.deaf;
    const newMuted = newDeaf; 
    setLocalStatus({ muted: newMuted, deaf: newDeaf });
    toggleDeaf(newDeaf);
    broadcastStatus({ muted: newMuted, deaf: newDeaf });
  };

  const executeJoinVoice = (ch) => {
    const cid = ch.channelId || ch.id;
    setVoiceStates((prev) => {
      const newState = { ...prev };
      Object.keys(newState).forEach(key => {
        newState[key] = newState[key].filter(u => u !== currentUser.uid);
      });
      newState[cid] = [...(newState[cid] || []), currentUser.uid];
      return newState;
    });

    joinVoiceChannel(currentServerId, cid);
    setSwitchModal({ show: false, targetChannel: null });
  };

  const handleVoiceClick = (ch) => {
    const cid = ch.channelId || ch.id;
    if (ch.locked && !canManageChannels) {
      alert("Bu oda kilitli! Sadece yöneticiler girebilir.");
      return;
    }
    if (!socket || !currentServerId || !currentUser || activeVoiceChannel === cid) return;
    if (activeVoiceChannel && activeVoiceChannel !== cid) {
      setSwitchModal({ show: true, targetChannel: ch });
      return;
    }
    executeJoinVoice(ch);
  };

  const handleDisconnect = (e) => {
    e?.stopPropagation();
    if (activeVoiceChannel && currentUser) {
      setVoiceStates((prev) => ({
        ...prev,
        [activeVoiceChannel]: (prev[activeVoiceChannel] || []).filter(
          (uid) => uid !== currentUser.uid
        ),
      }));
    }
    leaveVoiceChannel();
    setLocalStatus({ muted: false, deaf: false });
  };

  const broadcastStatus = (status) => {
    if (socket && currentUser && activeVoiceChannel) {
      socket.send(
        JSON.stringify({
          type: "USER_STATUS_UPDATE",
          userId: currentUser.uid,
          ...status,
        })
      );
      setUserStatuses((prev) => ({ ...prev, [currentUser.uid]: status }));
    }
  };

  const toggle = (cat) => setCollapsed((p) => ({ ...p, [cat]: !p[cat] }));
  const displayedTextChannels = localChannels.filter((c) => c.type === "text");
  const displayedVoiceChannels = localChannels.filter((c) => c.type === "voice");

  if (!serverInfo) return <div className={styles.glassSidebar}>Yükleniyor...</div>;

  return (
    <div className={styles.glassSidebar}>
      {/* MODALLAR */}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          devices={{ inputs: inputDevices, outputs: outputDevices, selectedMic, selectedSpeaker }}
          actions={{ switchMicrophone, switchSpeaker }}
        />
      )}
      {createModal.show && (
        <CreateChannelModal
          onClose={() => setCreateModal({ show: false, type: "text" })}
          serverId={currentServerId}
          type={createModal.type}
          onCreated={(newCh) => setLocalChannels((prev) => [...prev, newCh])}
        />
      )}
      {showVoiceRoomSettings && selectedVoiceRoom && (
        <VoiceRoomSettingsModal
          channel={selectedVoiceRoom}
          serverId={currentServerId}
          onClose={() => { setShowVoiceRoomSettings(false); setSelectedVoiceRoom(null); }}
          onDeleted={(id) => setLocalChannels((p) => p.filter((c) => (c.channelId || c.id) !== id))}
        />
      )}
      {showTextChannelSettings && selectedTextChannel && (
        <TextChannelSettingsModal
          channel={selectedTextChannel}
          serverId={currentServerId}
          onClose={() => { setShowTextChannelSettings(false); setSelectedTextChannel(null); }}
        />
      )}
      {switchModal.show && (
        <SwitchVoiceModal
          targetChannelName={switchModal.targetChannel?.name}
          onConfirm={() => executeJoinVoice(switchModal.targetChannel)}
          onCancel={() => setSwitchModal({ show: false, targetChannel: null })}
        />
      )}

      {/* HEADER */}
      <div className={styles.premiumHeader}>
        <div className={styles.headerInner}>
          <img src={serverInfo.icon || "https://via.placeholder.com/50"} alt="S" className={styles.serverImg} />
          <div className={styles.headerInfo}>
            <h1 className={styles.serverTitle}>{serverInfo.name}</h1>
          </div>
        </div>
      </div>

      <div className={styles.channelScroll}>
        <div className={styles.categoryWrapper}>
          <div className={styles.categoryTitle} onClick={() => toggle("text")}>
            <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
              <span className={styles.catName}>TEXT ZONES</span>
              {canManageChannels && <AddButton onClick={() => setCreateModal({ show: true, type: "text" })} />}
            </div>
            <FaChevronDown className={`${styles.chevron} ${collapsed.text ? styles.rotated : ""}`} />
          </div>
          {!collapsed.text && (
            <div className={styles.channelList}>
              {displayedTextChannels.map((ch) => {
                const id = ch.channelId || ch.id;
                return (
                  <div key={id} className={`${styles.channelItem} ${activeChannelId === id ? styles.activeItem : ""}`} onClick={() => onChannelSelect(ch)}>
                    <div className={styles.channelLeft}>
                      <FaHashtag className={styles.iconHash} />
                      <span className={styles.chName}>{ch.name}</span>
                    </div>
                    {canManageChannels && (
                      <FaCog className={styles.voiceSettingsIcon} style={{ marginLeft: "auto", color: "#ccc", cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); setSelectedTextChannel(ch); setShowTextChannelSettings(true); }} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className={styles.categoryWrapper}>
          <div className={styles.categoryTitle} onClick={() => toggle("voice")}>
            <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
              <span className={styles.catName}>VOICE PODS</span>
              {canManageChannels && <AddButton onClick={() => setCreateModal({ show: true, type: "voice" })} />}
            </div>
            <FaChevronDown className={`${styles.chevron} ${collapsed.voice ? styles.rotated : ""}`} />
          </div>
          {!collapsed.voice && (
            <div className={styles.channelList}>
              {displayedVoiceChannels.map((ch) => {
                const k = ch.channelId || ch.id;
                const usersInRoom = voiceStates[k] || [];
                const isActive = activeVoiceChannel === k;
                return (
                  <div key={k} className={usersInRoom.length > 0 || isActive ? `${styles.voiceWrapper} ${styles.voiceWrapperActive}` : styles.voiceWrapper}>
                    <div className={`${styles.channelItem} ${styles.voiceItem} ${isActive ? styles.activeItem : ""}`} onClick={() => handleVoiceClick(ch)}>
                      <div className={styles.channelLeft}>
                        <FaVolumeUp className={styles.iconVol} />
                        <span className={styles.chName}>{ch.name}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto" }}>
                        {ch.locked && <FaLock style={{ color: "#ff0000ff", fontSize: "12px" }} />}
                        {canManageChannels && (
                          <FaCog className={styles.voiceSettingsIcon} style={{ color: "#ccc", cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); setSelectedVoiceRoom(ch); setShowVoiceRoomSettings(true); }} />
                        )}
                      </div>
                    </div>
                    {usersInRoom.length > 0 && (
                      <div className={styles.voiceUserContainer}>
                        {usersInRoom.map((uid) => (
                          <VoiceUserCard key={uid} userId={uid} status={userStatuses[uid]} stream={currentUser?.uid === uid ? localStream : remoteStreams[uid]} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* CONTROL DECK (YENİLENEN FOOTER YAPISI) */}
      <div className={styles.controlDeck}>
        {/* ACTION LAYER - Ses kanalına girildiğinde yükselen kutu */}
        <div className={`${styles.actionLayer} ${activeVoiceChannel ? styles.layerActive : ""}`}>
          <div className={styles.actionInner}>
            <button className={`${styles.actionBtn} ${localStatus.muted ? styles.btnActiveRed : ""}`} onClick={handleToggleMute} title={localStatus.muted ? "Sesi Aç" : "Sustur"}>
              {localStatus.muted ? <FaMicrophoneSlash /> : <FaMicrophone />}
            </button>
            <button className={`${styles.actionBtn} ${localStatus.deaf ? styles.btnActiveRed : ""}`} onClick={handleToggleDeaf} title={localStatus.deaf ? "Sağırlaştırıcıyı Kapat" : "Sağırlaştır"}>
              <FaHeadphones />
            </button>
            <button className={styles.actionBtn} title="Ekran Paylaş"><MdScreenShare /></button>
            <div className={styles.actionDivider} />
            <button className={`${styles.actionBtn} ${styles.disconnectBtn}`} onClick={handleDisconnect} title="Bağlantıyı Kes"><FaPhoneSlash /></button>
          </div>
        </div>

        {/* PROFILE LAYER - Her zaman altta, Ayarlar butonu sağda */}
        <div className={styles.profileLayer}>
          {currentUser ? (
            <div className={styles.userProfileContainer}>
              <div className={styles.userProfile}>
                <div className={styles.avatarWrapper}>
                  <img src={currentUser.photoURL || "https://via.placeholder.com/50"} alt="Avatar" className={styles.avatarImg} />
                  <div className={`${styles.statusDot} ${currentUser.status === "online" ? styles.online : styles.offline}`}></div>
                </div>
                <div className={styles.userText}>
                  <span className={styles.userName}>{currentUser.displayName?.length > 18 ? `${currentUser.displayName.slice(0, 18)}...` : currentUser.displayName}</span>
                  <span className={styles.userStatusText}>{currentUser.status === "online" ? "Çevrimiçi" : "Çevrimdışı"}</span>
                </div>
              </div>
              {/* AYARLAR BUTONU - EN SAĞDA */}
              <button className={styles.profileSettingsBtn} onClick={() => setShowSettings(true)} title="Ses Ayarları">
                <FaCog />
              </button>
            </div>
          ) : (
            <div className={styles.loadingProfile}>Yükleniyor...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChannelSidebar;