import React, { useState, useEffect } from "react";
import { FaSignal, FaMicrophoneSlash, FaHeadphones } from "react-icons/fa";
import { useUserStore } from "../../../../Store/useUserStore";
import useAudioAnalysis from "../../../../hooks/useAudioAnalysis";
import styles from "../../ChannelSidebar/ChannelSidebar.module.css";

const VoiceUserCard = ({ userId, status, stream }) => {
  const { getUserProfile, usersCache, currentUser } = useUserStore();
  const [profile, setProfile] = useState(null);
  const isSpeaking = useAudioAnalysis(stream);

  const isMuted = status?.muted || false;
  const isDeaf = status?.deaf || false;

  useEffect(() => {
    if (currentUser && currentUser.uid === userId) {
      setProfile(currentUser);
    } else if (usersCache[userId]) {
      setProfile(usersCache[userId]);
    } else {
      getUserProfile(userId).then((data) => {
        if (data) setProfile(data);
      });
    }
  }, [userId, usersCache, currentUser, getUserProfile]);

  if (!profile) return <div className={styles.loadingCard}>...</div>;

  return (
    <div className={styles.voiceUserCard}>
      <div className={styles.cardInner}>
        <div className={styles.leftSection}>
          <div className={styles.avatarWrapper}>
            <img
              src={profile.photoURL || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"}
              className={`${styles.miniAvatar} ${isSpeaking ? styles.avatarSpeaking : ""}`}
              alt="user"
            />
          </div>
          <div className={styles.userInfoCol}>
            <span className={styles.voiceUserName}>{profile.displayName}</span>
            <div className={styles.voiceStatusRow}>
              {isSpeaking ? (
                <>
                  <FaSignal className={styles.statusIcon} />
                  <span className={styles.voiceUserStatus}>Konuşuyor</span>
                </>
              ) : (
                <span className={styles.voiceUserStatus} style={{ color: "#777" }}>
                  Ses Bağlı
                </span>
              )}
            </div>
          </div>
        </div>
        {(isMuted || isDeaf) && (
          <div className={styles.rightIcons}>
            {isMuted && <div className={styles.statusIconBox}><FaMicrophoneSlash className={styles.miniStatusIcon} /></div>}
            {isDeaf && <div className={styles.statusIconBox}><FaHeadphones className={styles.miniStatusIcon} /></div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceUserCard;