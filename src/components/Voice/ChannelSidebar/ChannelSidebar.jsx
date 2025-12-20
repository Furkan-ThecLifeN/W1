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
import { useUserStore } from "../../../Store/useUserStore";
import { getAuth } from "firebase/auth";
import styles from "./ChannelSidebar.module.css";
import { useWebRTC } from "../../../hooks/useWebRTC";

// --- MODALS ---
import VoiceUserCard from "../Modals/VoiceUserCard/VoiceUserCard";
import SettingsModal from "../Modals/SettingsModal/SettingsModal";
import VoiceRoomSettingsModal from "../Modals/VoiceRoomSettingsModal/VoiceRoomSettingsModal";
import CreateChannelModal from "../Modals/CreateChannelModal/CreateChannelModal";
import AddButton from "../Modals/AddButton/AddButton";
import TextChannelSettingsModal from "../Modals/TextChannelSettingsModal/TextChannelSettingsModal"; // New Import

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

  // Socket & Auth
  const [socketReady, setSocketReady] = useState(false);
  const [userStatuses, setUserStatuses] = useState({});
  const [localStatus, setLocalStatus] = useState({ muted: false, deaf: false });

  // Modals
  const [showSettings, setShowSettings] = useState(false);
  const [showVoiceRoomSettings, setShowVoiceRoomSettings] = useState(false);
  const [showTextChannelSettings, setShowTextChannelSettings] = useState(false); // New State
  const [selectedVoiceRoom, setSelectedVoiceRoom] = useState(null);
  const [selectedTextChannel, setSelectedTextChannel] = useState(null); // New State

  // Create Modal State
  const [createModal, setCreateModal] = useState({ show: false, type: "text" });

  const currentServerId = serverInfo?.id || serverInfo?.firebaseServerId;
  const { currentUser, fetchCurrentUser } = useUserStore();

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

  // PERMISSION CHECK
  const canManageChannels =
    serverInfo?.permissions?.includes("ADMIN") ||
    serverInfo?.permissions?.includes("MANAGE_CHANNELS");

  // --- CHANNEL MERGING ---
  useEffect(() => {
    if (serverInfo?.channels && serverInfo.channels.length > 0) {
      setLocalChannels(serverInfo.channels);
    } else if (textChannels.length > 0 || voiceChannels.length > 0) {
      const merged = [
        ...textChannels.map((c) => ({ ...c, type: "text" })),
        ...voiceChannels.map((c) => ({ ...c, type: "voice" })),
      ];
      const unique = [
        ...new Map(
          merged.map((item) => [item.channelId || item.id, item])
        ).values(),
      ];
      setLocalChannels(unique);
    }
  }, [serverInfo, textChannels, voiceChannels]);

  // --- AUTH ---
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((u) => {
      if (u) {
        fetchCurrentUser();
        if (socket && socket.readyState === 1 && currentServerId) {
          socket.send(
            JSON.stringify({
              type: "AUTH",
              userId: u.uid,
              serverIds: [currentServerId],
            })
          );
        }
      }
    });
    return () => unsubscribe();
  }, [fetchCurrentUser, socket, currentServerId]);

  // --- SOCKET ---
  useEffect(() => {
    if (!socket) return;

    const handleMsg = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === "AUTH_OK") setSocketReady(true);
        if (msg.type === "VOICE_STATE_UPDATE") {
          setVoiceStates((prev) => {
            const cur = prev[msg.channelId] || [];
            if (msg.action === "joined")
              return {
                ...prev,
                [msg.channelId]: [...new Set([...cur, msg.userId])],
              };
            else
              return {
                ...prev,
                [msg.channelId]: cur.filter((uid) => uid !== msg.userId),
              };
          });
        }
        if (msg.type === "CHANNEL_LIFECYCLE") {
          if (msg.serverId !== currentServerId) return;
          if (msg.action === "created") {
            setLocalChannels((prev) => {
              if (prev.find((c) => c.channelId === msg.channelData.channelId))
                return prev;
              return [...prev, msg.channelData];
            });
          } else if (msg.action === "deleted") {
            setLocalChannels((prev) =>
              prev.filter((c) => (c.channelId || c.id) !== msg.channelData.id)
            );
          } else if (msg.action === "updated") {
            setLocalChannels((prev) =>
              prev.map((c) =>
                (c.channelId || c.id) === msg.channelData.id
                  ? { ...c, ...msg.channelData }
                  : c
              )
            );
          }
        }
        if (msg.type === "USER_STATUS_UPDATE") {
          setUserStatuses((prev) => ({
            ...prev,
            [msg.userId]: { muted: msg.muted, deaf: msg.deaf },
          }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    socket.addEventListener("message", handleMsg);
    return () => socket.removeEventListener("message", handleMsg);
  }, [socket, currentServerId]);

  // --- ACTIONS ---
  const handleOpenCreateModal = (type) => {
    const currentCount = localChannels.filter((c) => c.type === type).length;
    if (type === "text" && currentCount >= 3) {
      alert("Maksimum Text Kanalı sınırına ulaştınız.");
      return;
    }
    if (type === "voice" && currentCount >= 5) {
      alert("Maksimum Ses Kanalı sınırına ulaştınız.");
      return;
    }
    setCreateModal({ show: true, type });
  };

  const handleLockRoom = (isLocked) => {
    if (!socket || !selectedVoiceRoom) return;
    socket.send(
      JSON.stringify({
        type: "LOCK_VOICE_CHANNEL",
        serverId: currentServerId,
        channelId: selectedVoiceRoom.channelId,
        locked: isLocked
      })
    );
  };

  const handleRenameRoom = (newName) => {
    if (!socket || !selectedVoiceRoom) return;
    socket.send(
      JSON.stringify({
        type: "RENAME_VOICE_CHANNEL",
        serverId: currentServerId,
        channelId: selectedVoiceRoom.channelId,
        newName,
      })
    );
  };

  // Logic for renaming Text Channel
  const handleRenameTextChannel = (newName) => {
    if (!socket || !selectedTextChannel) return;
    socket.send(
      JSON.stringify({
        type: "RENAME_TEXT_CHANNEL",
        serverId: currentServerId,
        channelId: selectedTextChannel.channelId || selectedTextChannel.id,
        newName,
      })
    );
  };

  // Logic for deleting Text Channel
  const handleDeleteTextChannel = () => {
    if (!socket || !selectedTextChannel) return;
    socket.send(
      JSON.stringify({
        type: "DELETE_TEXT_CHANNEL",
        serverId: currentServerId,
        channelId: selectedTextChannel.channelId || selectedTextChannel.id,
      })
    );
    setShowTextChannelSettings(false);
  };

  const handleVoiceClick = (ch) => {
    if (ch.locked && !canManageChannels) {
      alert("Bu oda kilitli!");
      return;
    }
    const cid = ch.channelId || ch.id;
    if (!socket || !currentServerId || activeVoiceChannel === cid) return;
    joinVoiceChannel(currentServerId, cid);
    if (currentUser?.uid) {
      setVoiceStates((prev) => {
        const newState = { ...prev };
        Object.keys(newState).forEach((key) => {
          newState[key] = (newState[key] || []).filter(
            (uid) => uid !== currentUser.uid
          );
        });
        newState[cid] = [
          ...new Set([...(newState[cid] || []), currentUser.uid]),
        ];
        return newState;
      });
    }
  };

  // --- UI HELPERS ---
  const toggle = (cat) => setCollapsed((p) => ({ ...p, [cat]: !p[cat] }));
  const handleToggleMute = () => {
    const newMuted = !localStatus.muted;
    setLocalStatus({ ...localStatus, muted: newMuted });
    toggleMic(newMuted);
    broadcastStatus({ ...localStatus, muted: newMuted });
  };
  const handleToggleDeaf = () => {
    const newDeaf = !localStatus.deaf;
    setLocalStatus({ muted: newDeaf, deaf: newDeaf });
    toggleDeaf(newDeaf);
    broadcastStatus({ muted: newDeaf, deaf: newDeaf });
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
  const handleDisconnect = (e) => {
    e.stopPropagation();
    leaveVoiceChannel();
    if (currentUser?.uid && activeVoiceChannel) {
      setVoiceStates((prev) => {
        const newState = { ...prev };
        if (newState[activeVoiceChannel])
          newState[activeVoiceChannel] = newState[activeVoiceChannel].filter(
            (uid) => uid !== currentUser.uid
          );
        return newState;
      });
      setLocalStatus({ muted: false, deaf: false });
    }
  };

  const displayedTextChannels = localChannels.filter((c) => c.type === "text");
  const displayedVoiceChannels = localChannels.filter(
    (c) => c.type === "voice"
  );

  if (!serverInfo) return <div className={styles.glassSidebar}>Loading...</div>;

  return (
    <div className={styles.glassSidebar}>
      {/* MODALS */}
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
          onCreated={(newChannel) => {
            setLocalChannels((prev) => {
              if (prev.find((c) => c.channelId === newChannel.channelId))
                return prev;
              return [...prev, newChannel];
            });
          }}
        />
      )}

      {showVoiceRoomSettings && selectedVoiceRoom && (
        <VoiceRoomSettingsModal
          channel={selectedVoiceRoom}
          onClose={() => {
            setShowVoiceRoomSettings(false);
            setSelectedVoiceRoom(null);
          }}
          onLock={handleLockRoom}
          onRename={handleRenameRoom}
          onDelete={() => { /* Add Delete Voice Logic */ }}
        />
      )}

      {/* NEW TEXT CHANNEL SETTINGS MODAL */}
      {showTextChannelSettings && selectedTextChannel && (
        <TextChannelSettingsModal
          channel={selectedTextChannel}
          onClose={() => {
            setShowTextChannelSettings(false);
            setSelectedTextChannel(null);
          }}
          onRename={handleRenameTextChannel}
          onDelete={handleDeleteTextChannel}
        />
      )}

      {/* HEADER */}
      <div className={styles.premiumHeader}>
        <div className={styles.headerInner}>
          <img
            src={serverInfo.img || serverInfo.icon || "https://via.placeholder.com/50"}
            alt="S"
            className={styles.serverImg}
          />
          <div className={styles.headerInfo}>
            <h1 className={styles.serverTitle}>{serverInfo.name}</h1>
          </div>
        </div>
      </div>

      <div className={styles.channelScroll}>
        {/* --- TEXT ZONES --- */}
        <div className={styles.categoryWrapper}>
          <div className={styles.categoryTitle} onClick={() => toggle("text")}>
            <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
              <span className={styles.catName}>TEXT ZONES</span>
              {canManageChannels && (
                <AddButton onClick={() => handleOpenCreateModal("text")} />
              )}
            </div>
            <FaChevronDown className={`${styles.chevron} ${collapsed.text ? styles.rotated : ""}`} />
          </div>
          {!collapsed.text && (
            <div className={styles.channelList}>
              {displayedTextChannels.map((ch, i) => {
                const k = ch.channelId || ch.id || `txt-${i}`;
                return (
                  <div
                    key={k}
                    className={`${styles.channelItem} ${activeChannelId === k ? styles.activeItem : ""}`}
                    onClick={() => onChannelSelect(ch)}
                  >
                    <div className={styles.channelLeft}>
                      <FaHashtag className={styles.iconHash} />
                      <span className={styles.chName}>{ch.name}</span>
                    </div>
                    {/* ADDED SETTINGS ICON FOR TEXT CHANNELS */}
                    {canManageChannels && (
                        <FaCog
                          className={styles.voiceSettingsIcon}
                          style={{ marginLeft: "auto", color: "#ccc", cursor: "pointer" }}
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

        {/* --- VOICE PODS --- */}
        <div className={styles.categoryWrapper}>
          <div className={styles.categoryTitle} onClick={() => toggle("voice")}>
            <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
              <span className={styles.catName}>VOICE PODS</span>
              {canManageChannels && (
                <AddButton onClick={() => handleOpenCreateModal("voice")} />
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
            <FaChevronDown className={`${styles.chevron} ${collapsed.voice ? styles.rotated : ""}`} />
          </div>
          {!collapsed.voice && (
            <div className={styles.channelList}>
              {displayedVoiceChannels.map((ch, i) => {
                const k = ch.channelId || ch.id || `vc-${i}`;
                const usrs = voiceStates[k] || [];
                const act = activeVoiceChannel === k;
                const isLocked = ch.locked;
                const wrapperClass = usrs.length > 0 || act
                  ? `${styles.voiceWrapper} ${styles.voiceWrapperActive}`
                  : styles.voiceWrapper;
                return (
                  <div key={k} className={wrapperClass}>
                    <div
                      className={`${styles.channelItem} ${styles.voiceItem} ${act ? styles.activeItem : ""}`}
                      onClick={() => handleVoiceClick(ch)}
                    >
                      <div className={styles.channelLeft}>
                        {isLocked ? (
                          <FaLock className={styles.iconVol} style={{ color: "#ff4d4d" }} />
                        ) : (
                          <FaVolumeUp className={styles.iconVol} />
                        )}
                        <span className={styles.chName}>{ch.name}</span>
                      </div>
                      {canManageChannels && (
                        <FaCog
                          className={styles.voiceSettingsIcon}
                          style={{ marginLeft: "auto", color: "#ccc", cursor: "pointer" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedVoiceRoom(ch);
                            setShowVoiceRoomSettings(true);
                          }}
                        />
                      )}
                    </div>
                    {usrs.length > 0 && (
                      <div className={styles.voiceUserContainer}>
                        {usrs.map((uid) => {
                          const isMe = currentUser?.uid === uid;
                          return (
                            <VoiceUserCard
                              key={uid}
                              userId={uid}
                              status={userStatuses[uid]}
                              stream={isMe ? localStream : remoteStreams[uid]}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* CONTROL DECK */}
      <div className={styles.controlDeck}>
        <div className={styles.deckGlass}>
          {currentUser ? (
            <div className={styles.userProfile}>
              <div className={styles.avatarContainer}>
                <img
                  src={currentUser.photoURL || "https://via.placeholder.com/50"}
                  alt="Avatar"
                  className={styles.avatarImg}
                />
                <div className={`${styles.onlineBadge} ${currentUser.status === "online" ? styles.statusOnline : styles.statusOffline}`}></div>
              </div>
              <div className={styles.userInfo}>
                <span className={styles.uName}>{currentUser.displayName}</span>
              </div>
            </div>
          ) : (
            <div className={styles.userInfo}>Loading...</div>
          )}
          <div className={styles.deckActions}>
            <button
              className={`${styles.deckBtn} ${localStatus.muted ? styles.btnActive : ""}`}
              onClick={handleToggleMute}
            >
              {localStatus.muted ? <FaMicrophoneSlash className={styles.iconRed} /> : <FaMicrophone />}
            </button>
            <button
              className={`${styles.deckBtn} ${localStatus.deaf ? styles.btnActive : ""}`}
              onClick={handleToggleDeaf}
            >
              <FaHeadphones className={localStatus.deaf ? styles.iconRed : ""} />
            </button>
            {activeVoiceChannel ? (
              <button
                className={styles.deckBtn}
                onClick={handleDisconnect}
                style={{ color: "#f70303ff" }}
              >
                <FaPhoneSlash />
              </button>
            ) : (
              <button className={styles.deckBtn} onClick={() => setShowSettings(true)}>
                <FaCog />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChannelSidebar;