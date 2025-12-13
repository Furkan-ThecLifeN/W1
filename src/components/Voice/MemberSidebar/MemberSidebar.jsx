import React from "react";
import { FaCrown, FaGamepad, FaSpotify, FaUsers } from "react-icons/fa";
import styles from "./MemberSidebar.module.css";

const MemberSidebar = () => {
  
  // MOCK DATA
  const members = [
    {
      id: 1,
      name: "TheArchitect",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80",
      role: "owner",
      status: "online",
      activity: "Coding VoCentra",
      activityType: "playing"
    },
    {
      id: 2,
      name: "CyberQueen",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
      role: "admin",
      status: "dnd",
      activity: "Listening to Lo-Fi",
      activityType: "listening"
    },
    {
      id: 3,
      name: "GlitchHunter",
      avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&q=80",
      role: "member",
      status: "online",
      activity: "Ranked Match",
      activityType: "playing"
    },
    {
      id: 4,
      name: "PixelDrift",
      avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&q=80",
      role: "member",
      status: "idle",
      activity: null
    },
    {
      id: 5,
      name: "GhostUser",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&q=80",
      role: "offline",
      status: "offline",
      activity: null
    },
    {
      id: 6,
      name: "NeonPilot",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80",
      role: "offline",
      status: "offline",
      activity: null
    },
  ];

  // Gruplama
  const groupedMembers = {
    "Yöneticiler": members.filter(m => m.role === "owner" || m.role === "admin"),
    "Çevrimiçi": members.filter(m => m.role === "member" && m.status !== "offline"),
    "Çevrimdışı": members.filter(m => m.status === "offline"),
  };

  return (
    <div className={styles.memberSidebar}>
      
      {/* --- YENİ HEADER --- */}
      <div className={styles.headerWrapper}>
        <div className={styles.headerTitleGroup}>
          <FaUsers className={styles.headerIcon} />
          <h2 className={styles.headerTitle}>Üyeler</h2>
        </div>
      </div>

      {/* MEMBER LIST */}
      <div className={styles.memberScroll}>
        
        {Object.entries(groupedMembers).map(([roleName, users]) => (
          users.length > 0 && (
            <div key={roleName} className={styles.roleGroup}>
              
              <div className={styles.roleHeader}>
                {roleName} — {users.length}
              </div>

              {users.map((user) => (
                <div key={user.id} className={styles.memberItem}>
                  
                  {/* Avatar & Status */}
                  <div className={styles.avatarWrapper}>
                    <img src={user.avatar} alt={user.name} className={styles.avatar} />
                    <div className={`${styles.statusDot} ${styles[user.status]}`}></div>
                  </div>

                  {/* Info */}
                  <div className={styles.memberInfo}>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                      <span className={styles.memberName}>{user.name}</span>
                      {user.role === "owner" && <FaCrown className={styles.ownerIcon} />}
                    </div>
                    
                    {/* Activity Text */}
                    {user.activity ? (
                      <span className={`${styles.memberStatusMsg} ${styles[user.activityType]}`}>
                        {user.activityType === "playing" && <FaGamepad style={{marginRight:4, fontSize:10}}/>}
                        {user.activityType === "listening" && <FaSpotify style={{marginRight:4, fontSize:10}}/>}
                        {user.activity}
                      </span>
                    ) : (
                      <span className={styles.memberStatusMsg}>
                         {/* Durum yoksa boş bırakıyoruz */}
                      </span>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )
        ))}

      </div>
    </div>
  );
};

export default MemberSidebar;