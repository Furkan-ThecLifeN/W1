import React, { useState, useEffect } from "react";
import {
  FaChevronDown, FaHashtag, FaVolumeUp, FaCog, FaMicrophone,
  FaHeadphones, FaPhoneSlash, FaPlus, FaMicrophoneSlash, FaLock
} from "react-icons/fa";
import { useUserStore } from "../../../Store/useUserStore";
import { getAuth } from "firebase/auth";
import styles from "./ChannelSidebar.module.css";
import { useWebRTC } from "../../../hooks/useWebRTC";

// --- MODAL & BİLEŞEN IMPORTLARI ---
import VoiceUserCard from "../Modals/VoiceUserCard/VoiceUserCard"; 
import SettingsModal from "../Modals/SettingsModal/SettingsModal";
import CreateTextChannelModal from "../Modals/CreateTextChannelModal/CreateTextChannelModal";
import VoiceRoomSettingsModal from "../Modals/VoiceRoomSettingsModal/VoiceRoomSettingsModal";

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
  const [tempChannels, setTempChannels] = useState([]);

  // Socket Auth Durumu
  const [socketReady, setSocketReady] = useState(false);

  const [userStatuses, setUserStatuses] = useState({});
  const [localStatus, setLocalStatus] = useState({ muted: false, deaf: false });

  // Modal State'leri
  const [showSettings, setShowSettings] = useState(false);
  const [showCreateText, setShowCreateText] = useState(false);
  const [showVoiceRoomSettings, setShowVoiceRoomSettings] = useState(false);
  const [selectedVoiceRoom, setSelectedVoiceRoom] = useState(null);

  const currentServerId = serverInfo?.id || serverInfo?.firebaseServerId;
  const { currentUser, fetchCurrentUser } = useUserStore();

  const {
    joinVoiceChannel, leaveVoiceChannel, activeVoiceChannel,
    localStream, remoteStreams, toggleMic, toggleDeaf,
    inputDevices, outputDevices, selectedMic, selectedSpeaker,
    switchMicrophone, switchSpeaker,
  } = useWebRTC(socket, currentUser);

  // --- AUTH & INIT ---
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((u) => {
      if (u) {
        fetchCurrentUser();
        if (socket && socket.readyState === 1 && currentServerId) {
          // Auth mesajı gönderiyoruz
          socket.send(JSON.stringify({
            type: "AUTH",
            userId: u.uid,
            serverIds: [currentServerId],
          }));
          // Geçici olarak frontend'de ready true yapabiliriz veya backend cevabını bekleyebiliriz.
          // Eğer backend "AUTH_OK" göndermiyorsa burayı true yapman gerekebilir:
          // setSocketReady(true); 
        }
      }
    });
    return () => unsubscribe();
  }, [fetchCurrentUser, socket, currentServerId]);

  // --- SOCKET EVENT LISTENER ---
  useEffect(() => {
    if (!socket) return;
    
    // Socket open olduğunda veya bağlandığında ready state kontrolü
    if (socket.readyState === 1) {
        // Eğer backend AUTH_OK göndermiyorsa, butonun çalışması için varsayılan true yapabilirsin
        // setSocketReady(true); 
    }

    const handleMsg = (e) => {
      try {
        const msg = JSON.parse(e.data);

        // 1. Auth Başarılı (Socket tam hazır)
        if (msg.type === "AUTH_OK") {
            setSocketReady(true);
        }

        // 2. Ses Odası Kullanıcıları
        if (msg.type === "VOICE_STATE_UPDATE") {
          setVoiceStates((prev) => {
            const cur = prev[msg.channelId] || [];
            if (msg.action === "joined") return { ...prev, [msg.channelId]: [...new Set([...cur, msg.userId])] };
            else return { ...prev, [msg.channelId]: cur.filter((uid) => uid !== msg.userId) };
          });
        }

        // 3. Kanal İşlemleri
        if (msg.type === "CHANNEL_LIFECYCLE") {
          if (msg.action === "created") {
            setTempChannels((p) => {
              if (p.find((c) => c.channelId === msg.channelData.id)) return p;
              return [...p, {
                channelId: msg.channelData.id,
                name: msg.channelData.name,
                type: msg.channelData.type,
                ownerId: msg.channelData.owner,
                locked: msg.channelData.locked,
              }];
            });
            if (msg.channelData.owner === currentUser?.uid) {
              joinVoiceChannel(currentServerId, msg.channelData.id);
            }
          } else if (msg.action === "deleted") {
            setTempChannels((p) => p.filter((c) => c.channelId !== msg.channelData.id));
            if (selectedVoiceRoom?.channelId === msg.channelData.id) {
              setShowVoiceRoomSettings(false);
              setSelectedVoiceRoom(null);
            }
          } else if (msg.action === "updated") {
            setTempChannels((prev) =>
              prev.map((c) => c.channelId === msg.channelData.id ? { ...c, ...msg.channelData } : c)
            );
            if (selectedVoiceRoom?.channelId === msg.channelData.id) {
              setSelectedVoiceRoom((prev) => ({ ...prev, ...msg.channelData }));
            }
          }
        }

        // 4. Sync
        if (msg.type === "SYNC_TEMP_CHANNELS") {
          setTempChannels(msg.channels.map((c) => ({
            channelId: c.id, name: c.name, type: c.type, ownerId: c.owner, locked: c.locked,
          })));
        }

        // 5. Status
        if (msg.type === "USER_STATUS_UPDATE") {
          setUserStatuses((prev) => ({ ...prev, [msg.userId]: { muted: msg.muted, deaf: msg.deaf } }));
        }
      } catch (err) { console.error(err); }
    };
    socket.addEventListener("message", handleMsg);
    return () => socket.removeEventListener("message", handleMsg);
  }, [socket, selectedVoiceRoom, currentUser, currentServerId, joinVoiceChannel]);

  // --- ACTIONS ---
  
  const createTempVoice = () => {
    // Tıklanınca kontrol et, eğer hazır değilse uyarı ver veya işlem yapma
    if (!socket || socket.readyState !== 1) {
        console.warn("Socket bağlı değil.");
        return;
    }
    // Auth kontrolü: Backend AUTH_OK göndermiyorsa bu kontrolü kaldırabilirsin.
    if (!socketReady) {
        console.warn("Socket Auth bekleniyor..."); 
        // Eğer backend AUTH_OK atmıyorsa burayı geçici olarak bypass et:
        // socketReady kontrolünü kaldırıp direkt gönder.
    }
    
    socket.send(JSON.stringify({ type: "JOIN_VOICE", serverId: currentServerId, channelId: "VOICE_MASTER" }));
  };

  const createTempText = (name) => {
    if (!socket || socket.readyState !== 1) return;
    socket.send(JSON.stringify({ type: "CREATE_TEMP_TEXT_CHANNEL", serverId: currentServerId, name }));
    setShowCreateText(false);
  };

  const handleLockRoom = () => {
    if (!socket || !selectedVoiceRoom) return;
    socket.send(JSON.stringify({ type: "LOCK_VOICE_CHANNEL", serverId: currentServerId, channelId: selectedVoiceRoom.channelId }));
  };

  const handleRenameRoom = (newName) => {
    if (!socket || !selectedVoiceRoom) return;
    socket.send(JSON.stringify({ type: "RENAME_VOICE_CHANNEL", serverId: currentServerId, channelId: selectedVoiceRoom.channelId, newName }));
  };

  const handleVoiceClick = (ch) => {
    if (ch.locked && ch.ownerId !== currentUser?.uid) {
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
          newState[key] = newState[key].filter((uid) => uid !== currentUser.uid);
        });
        newState[cid] = [...new Set([...(newState[cid] || []), currentUser.uid])];
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
      socket.send(JSON.stringify({ type: "USER_STATUS_UPDATE", userId: currentUser.uid, ...status }));
      setUserStatuses((prev) => ({ ...prev, [currentUser.uid]: status }));
    }
  };

  const handleDisconnect = (e) => {
    e.stopPropagation();
    leaveVoiceChannel();
    if (currentUser?.uid && activeVoiceChannel) {
      setVoiceStates((prev) => {
        const newState = { ...prev };
        if (newState[activeVoiceChannel]) newState[activeVoiceChannel] = newState[activeVoiceChannel].filter((uid) => uid !== currentUser.uid);
        return newState;
      });
      setLocalStatus({ muted: false, deaf: false });
    }
  };

  const allTextChannels = [...textChannels, ...tempChannels.filter((c) => c.type === "text")];
  const allVoiceChannels = [...(voiceChannels.length ? voiceChannels : [{ channelId: "v1", name: "Lobby" }]), ...tempChannels.filter((c) => c.type === "voice")];

  if (!serverInfo) return <div className={styles.glassSidebar}>Loading...</div>;

  return (
    <div className={styles.glassSidebar}>
      
      {/* --- MODALLAR --- */}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          devices={{ inputs: inputDevices, outputs: outputDevices, selectedMic, selectedSpeaker }}
          actions={{ switchMicrophone, switchSpeaker }}
        />
      )}
      {showCreateText && (
        <CreateTextChannelModal onClose={() => setShowCreateText(false)} onCreate={createTempText} />
      )}
      {showVoiceRoomSettings && selectedVoiceRoom && (
        <VoiceRoomSettingsModal
          channel={selectedVoiceRoom}
          onClose={() => { setShowVoiceRoomSettings(false); setSelectedVoiceRoom(null); }}
          onLock={handleLockRoom}
          onRename={handleRenameRoom}
        />
      )}

      {/* --- HEADER --- */}
      <div className={styles.premiumHeader}>
        <div className={styles.headerInner}>
          <img src={serverInfo.img || serverInfo.icon || "https://via.placeholder.com/50"} alt="S" className={styles.serverImg} />
          <div className={styles.headerInfo}><h1 className={styles.serverTitle}>{serverInfo.name}</h1></div>
        </div>
      </div>

      <div className={styles.channelScroll}>
        {/* --- TEXT KANALLARI --- */}
        <div className={styles.categoryWrapper}>
          <div className={styles.categoryTitle} onClick={() => toggle("text")}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className={styles.catName}>TEXT ZONES</span>
              <div onClick={(e) => { e.stopPropagation(); setShowCreateText(true); }} className={styles.addBtnWrapper}><FaPlus className={styles.addBtnIcon} /></div>
            </div>
            <FaChevronDown className={`${styles.chevron} ${collapsed.text ? styles.rotated : ""}`} />
          </div>
          {!collapsed.text && (
            <div className={styles.channelList}>
              {allTextChannels.map((ch, i) => {
                const k = ch.channelId || ch.id || `txt-${i}`;
                const isTemp = k.toString().startsWith("temp_text_");
                return (
                  <div key={k} className={`${styles.channelItem} ${activeChannelId === k ? styles.activeItem : ""}`} onClick={() => onChannelSelect(ch)}>
                    <div className={styles.channelLeft}>
                      <FaHashtag className={styles.iconHash} style={{ color: isTemp ? "#facc15" : "" }} />
                      <span className={styles.chName} style={{ color: isTemp ? "#fef08a" : "" }}>{ch.name}</span>
                    </div>
                    {activeChannelId === k && <div className={styles.activeGlowBar}></div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* --- VOICE KANALLARI --- */}
        <div className={styles.categoryWrapper}>
          <div className={styles.categoryTitle} onClick={() => toggle("voice")}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className={styles.catName}>VOICE PODS</span>
              <div onClick={(e) => { e.stopPropagation(); setShowSettings(true); }} className={styles.settingsBtnWrapper}><FaCog className={styles.addBtnIcon} /></div>
            </div>
            <FaChevronDown className={`${styles.chevron} ${collapsed.voice ? styles.rotated : ""}`} />
          </div>
          {!collapsed.voice && (
            <div className={styles.channelList}>
              
              {/* ✅ YENİ ODA OLUŞTUR BUTONU - DÜZELTİLDİ */}
              {/* Artık socketReady olmasa bile görünüyor ama sönük duruyor */}
              <div
                className={`${styles.channelItem} ${styles.voiceItem}`}
                style={{ 
                    // Socket hazırsa %90 opak, değilse %40 (sönük)
                    opacity: socketReady ? 0.9 : 0.4, 
                    border: "1px dashed rgba(255,255,255,0.2)", 
                    marginBottom: "5px",
                    // Hazır değilse tıklanamaz imleci
                    cursor: socketReady ? "pointer" : "not-allowed" 
                }}
                onClick={(e) => { 
                    e.stopPropagation(); 
                    // Sadece hazırsa çalıştır
                    if(socketReady) createTempVoice(); 
                }}
              >
                <div className={styles.channelLeft}>
                  <FaPlus className={styles.iconVol} style={{ fontSize: "0.9rem" }} />
                  <span className={styles.chName} style={{ fontStyle: "italic" }}>
                    {socketReady ? "Yeni Oda Oluştur" : "Bağlanıyor..."}
                  </span>
                </div>
              </div>

              {/* MEVCUT SES KANALLARI */}
              {allVoiceChannels.map((ch, i) => {
                const k = ch.channelId || ch.id || `vc-${i}`;
                const usrs = voiceStates[k] || [];
                const act = activeVoiceChannel === k;
                const isTemp = ch.type === "voice" && k.toString().startsWith("temp_");
                const isOwner = isTemp && ch.ownerId === currentUser?.uid;
                const isLocked = ch.locked;
                const wrapperClass = usrs.length > 0 || act ? `${styles.voiceWrapper} ${styles.voiceWrapperActive}` : styles.voiceWrapper;

                return (
                  <div key={k} className={wrapperClass}>
                    <div className={`${styles.channelItem} ${styles.voiceItem} ${act ? styles.activeItem : ""}`} onClick={() => handleVoiceClick(ch)}>
                      <div className={styles.channelLeft}>
                        {isLocked ? <FaLock className={styles.iconVol} style={{ color: "#ff4d4d" }} /> : <FaVolumeUp className={styles.iconVol} style={{ color: isTemp ? "#facc15" : "" }} />}
                        <span className={styles.chName} style={{ color: isTemp ? "#fef08a" : "" }}>{ch.name}</span>
                      </div>
                      {isOwner && (
                        <FaCog
                          className={styles.voiceSettingsIcon}
                          style={{ marginLeft: "auto", color: "#ccc", cursor: "pointer" }}
                          onClick={(e) => { e.stopPropagation(); setSelectedVoiceRoom(ch); setShowVoiceRoomSettings(true); }}
                        />
                      )}
                    </div>
                    {usrs.length > 0 && (
                      <div className={styles.voiceUserContainer}>
                        {usrs.map((uid) => {
                          const isMe = currentUser?.uid === uid;
                          return <VoiceUserCard key={uid} userId={uid} status={userStatuses[uid]} stream={isMe ? localStream : remoteStreams[uid]} />;
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

      {/* --- KULLANICI KONTROL PANELİ (ALT) --- */}
      <div className={styles.controlDeck}>
        <div className={styles.deckGlass}>
          {currentUser ? (
            <div className={styles.userProfile}>
              <div className={styles.avatarContainer}>
                <img src={currentUser.photoURL || "https://via.placeholder.com/50"} alt="Av" className={styles.avatarImg} />
                <div className={`${styles.onlineBadge} ${currentUser.status === "online" ? styles.statusOnline : styles.statusOffline}`}></div>
              </div>
              <div className={styles.userInfo}><span className={styles.uName}>{currentUser.displayName}</span></div>
            </div>
          ) : <div className={styles.userInfo}>Loading...</div>}

          <div className={styles.deckActions}>
            <button className={`${styles.deckBtn} ${localStatus.muted ? styles.btnActive : ""}`} onClick={handleToggleMute}>
              {localStatus.muted ? <FaMicrophoneSlash className={styles.iconRed} /> : <FaMicrophone />}
            </button>
            <button className={`${styles.deckBtn} ${localStatus.deaf ? styles.btnActive : ""}`} onClick={handleToggleDeaf}>
              <FaHeadphones className={localStatus.deaf ? styles.iconRed : ""} />
            </button>
            {activeVoiceChannel ? (
              <button className={styles.deckBtn} onClick={handleDisconnect} style={{ color: "#ff4d4d" }}><FaPhoneSlash /></button>
            ) : (
              <button className={styles.deckBtn} onClick={() => setShowSettings(true)}><FaCog /></button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChannelSidebar;