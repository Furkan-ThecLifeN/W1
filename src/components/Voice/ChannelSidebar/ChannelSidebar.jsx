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
import { useServerStore } from "../../../Store/useServerStore"; // ✅ Eklendi
import styles from "./ChannelSidebar.module.css";
import { useWebRTC } from "../../../hooks/useWebRTC";

import VoiceUserCard from "../Modals/VoiceUserCard/VoiceUserCard";
import SettingsModal from "../Modals/SettingsModal/SettingsModal";
import VoiceRoomSettingsModal from "../Modals/VoiceRoomSettingsModal/VoiceRoomSettingsModal";
import CreateChannelModal from "../Modals/CreateChannelModal/CreateChannelModal";
import AddButton from "../Modals/AddButton/AddButton";
import TextChannelSettingsModal from "../Modals/TextChannelSettingsModal/TextChannelSettingsModal";

const ChannelSidebar = ({
  serverInfo,
  textChannels = [],
  voiceChannels = [],
  activeChannelId,
  onChannelSelect,
  socket,
}) => {
  const [collapsed, setCollapsed] = useState({ text: false, voice: false });
  const [voiceStates, setVoiceStates] = useState({});
  const [localChannels, setLocalChannels] = useState([]);
  const [socketReady, setSocketReady] = useState(false);
  const [userStatuses, setUserStatuses] = useState({});
  const [localStatus, setLocalStatus] = useState({ muted: false, deaf: false });

  const [showSettings, setShowSettings] = useState(false);
  const [showVoiceRoomSettings, setShowVoiceRoomSettings] = useState(false);
  const [showTextChannelSettings, setShowTextChannelSettings] = useState(false);
  const [selectedVoiceRoom, setSelectedVoiceRoom] = useState(null);
  const [selectedTextChannel, setSelectedTextChannel] = useState(null);
  const [createModal, setCreateModal] = useState({ show: false, type: "text" });

  const currentServerId = serverInfo?.id || serverInfo?.firebaseServerId;
  const { currentUser, fetchCurrentUser } = useUserStore();
  const { updateServerChannel } = useServerStore(); // ✅ Global store aksiyonu

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

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

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

  // --- 3. SOCKET LISTENERS (REAL-TIME STATE & UI SYNC) ---
  useEffect(() => {
    if (!socket) return;

    const handleMsg = (e) => {
      try {
        const msg = JSON.parse(e.data);

        // --- AUTH ---
        if (msg.type === "AUTH_OK") {
          setSocketReady(true);
          return;
        }

        // --- KANAL GÜNCELLEMELERİ (CREATE / DELETE / UPDATE) ---
        if (msg.type === "CHANNEL_LIFECYCLE_UPDATE") {
          const { action, channel, serverId } = msg;

          // Başka bir sunucuya aitse ignore et
          if (serverId && serverId !== currentServerId) return;

          // Backend hem channelId hem id gönderebilir, ikisini de kontrol et
          const incomingId = channel.channelId || channel.id;
          if (!incomingId) return;

          // ✅ GLOBAL STORE GÜNCELLEMESİ: Modalların ve genel sistemin veriyi görmesi için
          if (action === "updated") {
            updateServerChannel(currentServerId, channel);
          }

          setLocalChannels((prev) => {
            // CREATE: Listeye ekle (Mevcutsa ekleme)
            if (action === "created") {
              if (prev.some((c) => (c.channelId || c.id) === incomingId))
                return prev;
              return [...prev, channel];
            }

            // DELETE: Listeden çıkar
            if (action === "deleted") {
              return prev.filter((c) => (c.channelId || c.id) !== incomingId);
            }

            // UPDATE: İsmi, locked durumunu ve diğer tüm verileri anlık güncelle
            if (action === "updated") {
              return prev.map((oldChannel) => {
                const oldId = oldChannel.channelId || oldChannel.id;
                if (oldId === incomingId) {
                  // ✅ Referansı yenileyerek React'ı render'a zorluyoruz
                  return { ...oldChannel, ...channel };
                }
                return oldChannel;
              });
            }

            return prev;
          });
        }

        // --- SES ODASI DURUMLARI ---
        if (msg.type === "VOICE_STATE_UPDATE") {
          const roomKey = msg.channelId || msg.id;
          const { userId, action } = msg;
          if (!roomKey || !userId || !action) return;

          setVoiceStates((prev) => {
            const currentUsers = prev[roomKey] || [];

            if (action === "joined") {
              if (currentUsers.includes(userId)) return prev;
              return { ...prev, [roomKey]: [...currentUsers, userId] };
            }

            if (action === "left") {
              return {
                ...prev,
                [roomKey]: currentUsers.filter((id) => id !== userId),
              };
            }
            return prev;
          });
        }

        // --- KULLANICI DURUM GÜNCELLEMELERİ (MUTE/DEAF) ---
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

  const handleToggleMute = () => {
    if (localStatus.deaf) return;
    const newMuted = !localStatus.muted;
    setLocalStatus((p) => ({ ...p, muted: newMuted }));
    toggleMic(newMuted);
    broadcastStatus({ ...localStatus, muted: newMuted });
  };

  const handleToggleDeaf = () => {
    const newDeaf = !localStatus.deaf;
    const newMuted = newDeaf ? true : localStatus.muted;
    setLocalStatus({ muted: newMuted, deaf: newDeaf });
    toggleDeaf(newDeaf);
    broadcastStatus({ muted: newMuted, deaf: newDeaf });
  };

  const handleVoiceClick = (ch) => {
    if (ch.locked && !canManageChannels) {
      alert("Bu oda kilitli!");
      return;
    }
    const channelId = ch.channelId || ch.id;
    if (!socket || !currentServerId || !currentUser) return;
    if (activeVoiceChannel === channelId) return;
    setVoiceStates((prev) => {
      const cur = prev[channelId] || [];
      if (cur.includes(currentUser.uid)) return prev;
      return { ...prev, [channelId]: [...cur, currentUser.uid] };
    });
    joinVoiceChannel(currentServerId, channelId);
  };

  const handleDisconnect = (e) => {
    e.stopPropagation();
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
  const displayedVoiceChannels = localChannels.filter(
    (c) => c.type === "voice"
  );

  if (!serverInfo)
    return <div className={styles.glassSidebar}>Yükleniyor...</div>;

  return (
    <div className={styles.glassSidebar}>
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          devices={{
            inputs: inputDevices,
            outputs: outputDevices,
            selectedMic,
            selectedSpeaker,
          }}
          actions={{ switchMicrophone, switchSpeaker }}
        />
      )}
      {createModal.show && (
        <CreateChannelModal
          onClose={() => setCreateModal({ show: false, type: "text" })}
          serverId={currentServerId}
          type={createModal.type}
          onCreated={(newCh) => {
            setLocalChannels((prev) => {
              const id = newCh.channelId || newCh.id;
              if (prev.some((c) => (c.channelId || c.id) === id)) return prev;
              return [...prev, newCh];
            });
          }}
        />
      )}
      {showVoiceRoomSettings && selectedVoiceRoom && (
        <VoiceRoomSettingsModal
          channel={selectedVoiceRoom}
          serverId={currentServerId}
          onClose={() => {
            setShowVoiceRoomSettings(false);
            setSelectedVoiceRoom(null);
          }}
          onDeleted={(id) =>
            setLocalChannels((p) =>
              p.filter((c) => (c.channelId || c.id) !== id)
            )
          }
        />
      )}
      {showTextChannelSettings && selectedTextChannel && (
        <TextChannelSettingsModal
          channel={selectedTextChannel}
          serverId={currentServerId}
          onClose={() => {
            setShowTextChannelSettings(false);
            setSelectedTextChannel(null);
          }}
        />
      )}

      <div className={styles.premiumHeader}>
        <div className={styles.headerInner}>
          <img
            src={serverInfo.icon || "https://via.placeholder.com/50"}
            alt="S"
            className={styles.serverImg}
          />
          <div className={styles.headerInfo}>
            <h1 className={styles.serverTitle}>{serverInfo.name}</h1>
          </div>
        </div>
      </div>

      <div className={styles.channelScroll}>
        <div className={styles.categoryWrapper}>
          <div className={styles.categoryTitle} onClick={() => toggle("text")}>
            <div
              style={{ display: "flex", alignItems: "center", width: "100%" }}
            >
              <span className={styles.catName}>TEXT ZONES</span>
              {canManageChannels && (
                <AddButton
                  onClick={() => setCreateModal({ show: true, type: "text" })}
                />
              )}
            </div>
            <FaChevronDown
              className={`${styles.chevron} ${
                collapsed.text ? styles.rotated : ""
              }`}
            />
          </div>
          {!collapsed.text && (
            <div className={styles.channelList}>
              {displayedTextChannels.map((ch) => {
                const id = ch.channelId || ch.id;
                return (
                  <div
                    key={id}
                    className={`${styles.channelItem} ${
                      activeChannelId === id ? styles.activeItem : ""
                    }`}
                    onClick={() => onChannelSelect(ch)}
                  >
                    <div className={styles.channelLeft}>
                      <FaHashtag className={styles.iconHash} />
                      <span className={styles.chName}>{ch.name}</span>
                    </div>
                    {canManageChannels && (
                      <FaCog
                        className={styles.voiceSettingsIcon}
                        style={{
                          marginLeft: "auto",
                          color: "#ccc",
                          cursor: "pointer",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTextChannel(ch);
                          setShowTextChannelSettings(true);
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className={styles.categoryWrapper}>
          <div className={styles.categoryTitle} onClick={() => toggle("voice")}>
            <div
              style={{ display: "flex", alignItems: "center", width: "100%" }}
            >
              <span className={styles.catName}>VOICE PODS</span>
              {canManageChannels && (
                <AddButton
                  onClick={() => setCreateModal({ show: true, type: "voice" })}
                />
              )}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSettings(true);
                }}
                className={styles.settingsBtnWrapper}
                title="Settings"
                style={{ marginLeft: canManageChannels ? "5px" : "auto" }}
              >
                <FaCog className={styles.addBtnIcon} />
              </div>
            </div>
            <FaChevronDown
              className={`${styles.chevron} ${
                collapsed.voice ? styles.rotated : ""
              }`}
            />
          </div>
          {!collapsed.voice && (
            <div className={styles.channelList}>
              {displayedVoiceChannels.map((ch) => {
                const k = ch.channelId || ch.id;
                const usersInRoom = voiceStates[k] || [];
                const isActive = activeVoiceChannel === k;
                return (
                  <div
                    key={k}
                    className={
                      usersInRoom.length > 0 || isActive
                        ? `${styles.voiceWrapper} ${styles.voiceWrapperActive}`
                        : styles.voiceWrapper
                    }
                  >
                    <div
                      className={`${styles.channelItem} ${styles.voiceItem} ${
                        isActive ? styles.activeItem : ""
                      }`}
                      onClick={() => handleVoiceClick(ch)}
                    >
                      <div className={styles.channelLeft}>
                        <FaVolumeUp className={styles.iconVol} />
                        <span className={styles.chName}>{ch.name}</span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginLeft: "auto",
                        }}
                      >
                        {ch.locked && (
                          <FaLock
                            style={{ color: "#ff4d4d", fontSize: "12px" }}
                          />
                        )}
                        {canManageChannels && (
                          <FaCog
                            className={styles.voiceSettingsIcon}
                            style={{ color: "#ccc", cursor: "pointer" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedVoiceRoom(ch);
                              setShowVoiceRoomSettings(true);
                            }}
                          />
                        )}
                      </div>
                    </div>
                    {usersInRoom.length > 0 && (
                      <div className={styles.voiceUserContainer}>
                        {usersInRoom.map((uid) => (
                          <VoiceUserCard
                            key={uid}
                            userId={uid}
                            status={userStatuses[uid]}
                            stream={
                              currentUser?.uid === uid
                                ? localStream
                                : remoteStreams[uid]
                            }
                          />
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

      {/* CONTROL DECK (FOOTER) */}
      <div className={styles.controlDeck}>
        {/* ÜST KATMAN: SES VE AKSİYON KONTROLLERİ */}
        <div className={styles.actionLayer}>
          <div className={styles.actionInner}>
            <button
              className={`${styles.actionBtn} ${
                localStatus.muted ? styles.btnActiveRed : ""
              }`}
              onClick={handleToggleMute}
              title={localStatus.muted ? "Sesi Aç" : "Sustur"}
            >
              {localStatus.muted ? <FaMicrophoneSlash /> : <FaMicrophone />}
            </button>
            <button
              className={`${styles.actionBtn} ${
                localStatus.deaf ? styles.btnActiveRed : ""
              }`}
              onClick={handleToggleDeaf}
              title={
                localStatus.deaf ? "Sağırlaştırıcıyı Kapat" : "Sağırlaştır"
              }
            >
              <FaHeadphones />
            </button>

            {/* Ekran Paylaşma Butonu (Statik eklendi, fonksiyonu hook'una bağlayabilirsin) */}
            <button className={styles.actionBtn} title="Ekran Paylaş">
              <MdScreenShare  />
            </button>

            <div className={styles.actionDivider} />

            {activeVoiceChannel ? (
              <button
                className={`${styles.actionBtn} ${styles.disconnectBtn}`}
                onClick={handleDisconnect}
                title="Bağlantıyı Kes"
              >
                <FaPhoneSlash />
              </button>
            ) : (
              <button
                className={styles.actionBtn}
                onClick={() => setShowSettings(true)}
                title="Ayarlar"
              >
                <FaCog />
              </button>
            )}
          </div>
        </div>

        {/* ALT KATMAN: PROFİL KARTI */}
        <div className={styles.profileLayer}>
          {currentUser ? (
            <div className={styles.userProfile}>
              <div className={styles.avatarWrapper}>
                <img
                  src={currentUser.photoURL || "https://via.placeholder.com/50"}
                  alt="Avatar"
                  className={styles.avatarImg}
                />
                <div
                  className={`${styles.statusDot} ${
                    currentUser.status === "online"
                      ? styles.online
                      : styles.offline
                  }`}
                ></div>
              </div>
              <div className={styles.userText}>
                <span className={styles.userName}>
                  {currentUser.displayName?.length > 21
                    ? `${currentUser.displayName.slice(0, 21)}...`
                    : currentUser.displayName}
                </span>
                <span className={styles.userStatusText}>
                  {currentUser.status === "online" ? "Çevrimiçi" : "Çevrimdışı"}
                </span>
              </div>
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
