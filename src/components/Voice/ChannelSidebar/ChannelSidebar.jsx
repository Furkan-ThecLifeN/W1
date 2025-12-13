import React, { useState, useEffect } from "react";
import {
  FaChevronDown,
  FaHashtag,
  FaVolumeUp,
  FaCog,
  FaMicrophone,
  FaHeadphones,
} from "react-icons/fa";
import { useUserStore } from "../../../Store/useUserStore"; 
import { getAuth } from "firebase/auth";
import styles from "./ChannelSidebar.module.css";

const ChannelSidebar = ({
  serverInfo,
  textChannels = [],
  voiceChannels = [],
  activeChannelId,
  onChannelSelect,
}) => {
  const [collapsed, setCollapsed] = useState({ text: false, voice: false });
  
  // Kullanıcı profilini store'dan çek
  const { currentUser, fetchCurrentUser } = useUserStore();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchCurrentUser();
      }
    });
    return () => unsubscribe();
  }, [fetchCurrentUser]);

  // Varsayılan Statik Kanallar (İsteğe bağlı, kaldırmak istersen burayı boşalt)
  const defaultText = [
    { id: "t1", name: "general" },
    { id: "t2", name: "rules" },
  ];

  const defaultVoice = [
    { id: "v1", name: "Lobby", users: 0 },
  ];

  // Gelen verilerle varsayılanları birleştir
  const finalTextChannels = [...defaultText, ...textChannels];
  const finalVoiceChannels = [...defaultVoice, ...voiceChannels];

  const toggleCategory = (cat) => {
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  if (!serverInfo) {
    return <div className={styles.glassSidebar}>Loading...</div>;
  }

  return (
    <div className={styles.glassSidebar}>
      
      {/* --- SUNUCU HEADER --- */}
      <div className={styles.premiumHeader}>
        <div className={styles.headerInner}>
          <img 
            src={serverInfo.img || serverInfo.icon || "https://via.placeholder.com/50"} 
            alt="Server" 
            className={styles.serverImg} 
          />
          <div className={styles.headerInfo}>
            <h1 className={styles.serverTitle}>{serverInfo.name}</h1>
          </div>
        </div>
      </div>

      {/* --- KANAL LİSTESİ --- */}
      <div className={styles.channelScroll}>

        {/* TEXT KANALLARI */}
        <div className={styles.categoryWrapper}>
          <div className={styles.categoryTitle} onClick={() => toggleCategory("text")}>
            <span className={styles.catName}>TEXT ZONES</span>
            <FaChevronDown className={`${styles.chevron} ${collapsed.text ? styles.rotated : ""}`} />
          </div>

          {!collapsed.text && (
            <div className={styles.channelList}>
              {finalTextChannels.map((ch, index) => {
                // 🔥 HATA DÜZELTME: key benzersiz olmalı (channelId yoksa id, o da yoksa index)
                const uniqueKey = ch.channelId || ch.id || `txt-${index}`;
                return (
                  <div
                    key={uniqueKey}
                    className={`${styles.channelItem} ${activeChannelId === uniqueKey ? styles.activeItem : ""}`}
                    onClick={() => onChannelSelect(ch)}
                  >
                    <div className={styles.channelLeft}>
                      <FaHashtag className={styles.iconHash} />
                      <span className={styles.chName}>{ch.name}</span>
                    </div>
                    {activeChannelId === uniqueKey && <div className={styles.activeGlowBar}></div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SES KANALLARI */}
        <div className={styles.categoryWrapper}>
          <div className={styles.categoryTitle} onClick={() => toggleCategory("voice")}>
            <span className={styles.catName}>VOICE PODS</span>
            <FaChevronDown className={`${styles.chevron} ${collapsed.voice ? styles.rotated : ""}`} />
          </div>

          {!collapsed.voice && (
            <div className={styles.channelList}>
              {finalVoiceChannels.map((ch, index) => {
                // 🔥 HATA DÜZELTME: key benzersiz olmalı
                const uniqueKey = ch.channelId || ch.id || `vc-${index}`;
                return (
                  <div key={uniqueKey} className={`${styles.channelItem} ${styles.voiceItem}`}>
                    <div className={styles.channelLeft}>
                      <FaVolumeUp className={styles.iconVol} />
                      <span className={styles.chName}>{ch.name}</span>
                    </div>
                    {/* User count badge (varsa) */}
                    {ch.users > 0 && (
                      <div className={styles.userCountBadge}>
                        <span className={styles.countDot}></span> {ch.users}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* --- KULLANICI PROFİLİ (FOOTER) --- */}
      <div className={styles.controlDeck}>
        <div className={styles.deckGlass}>
          
          {currentUser ? (
            <div className={styles.userProfile}>
              <div className={styles.avatarContainer}>
                <img
                  src={currentUser.photoURL || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"}
                  alt="Avatar"
                  className={styles.avatarImg}
                />
                <div className={`${styles.onlineBadge} ${currentUser.status === 'online' ? styles.statusOnline : styles.statusOffline}`}></div>
              </div>

              <div className={styles.userInfo}>
                <span className={styles.uName}>{currentUser.displayName}</span>
                <span className={styles.uId}>@{currentUser.username}</span>
              </div>
            </div>
          ) : (
            <div className={styles.userInfo}>Yükleniyor...</div>
          )}

          <div className={styles.deckActions}>
            <button className={styles.deckBtn}><FaMicrophone /></button>
            <button className={styles.deckBtn}><FaHeadphones /></button>
            <button className={styles.deckBtn}><FaCog /></button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ChannelSidebar;