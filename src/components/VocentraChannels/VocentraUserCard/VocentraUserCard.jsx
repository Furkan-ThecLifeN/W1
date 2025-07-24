import React from 'react';
import { 
  RiGameFill,
  RiMusic2Fill,
  RiLiveFill,
  RiUser3Fill
} from 'react-icons/ri';
import styles from './VocentraUserCard.module.css';
import { MdMusicNote } from "react-icons/md";


const VocentraUserCard = () => {
  const roles = [
    {
      id: 1,
      name: 'Active',
      users: [
        {
          id: 1,
          name: 'Alexandra',
          avatar: 'https://i.pravatar.cc/150?img=60',
          status: 'active',
          activity: {
            type: 'game',
            name: 'Cyberpunk 2077',
            details: 'Night City - Level 42'
          }
        },
        {
          id: 2,
          name: 'Kai',
          avatar: 'https://i.pravatar.cc/150?img=32',
          status: 'active',
          activity: {
            type: 'music',
            name: 'Synthwave Radio',
            details: 'The Midnight - Sunset',
            lyrics: 'We\'re just a moment in the light...'
          }
        }
      ]
    },
    {
      id: 2,
      name: 'Idle',
      users: [
        {
          id: 3,
          name: 'Jin',
          avatar: 'https://i.pravatar.cc/150?img=45',
          status: 'idle',
          activity: {
            type: 'stream',
            name: 'Neon Dreams',
            details: 'Speedrunning Cyber Runner'
          }
        }
      ]
    },
    {
      id: 3,
      name: 'Away',
      users: [
        {
          id: 4,
          name: 'Zara',
          avatar: 'https://i.pravatar.cc/150?img=28',
          status: 'away',
          activity: null
        }
      ]
    }
  ];

  const getActivityIcon = (type) => {
    switch(type) {
      case 'game': return <RiGameFill className={styles.activityIcon} />;
      case 'music': return <RiMusic2Fill className={styles.activityIcon} />;
      case 'stream': return <RiLiveFill className={styles.activityIcon} />;
      default: return <RiUser3Fill className={styles.activityIcon} />;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <div className={styles.titleLine}></div>
          <h3 className={styles.title}>VoCentral</h3>
          <div className={styles.titleLine}></div>
        </div>
      </div>

      <div className={styles.content}>
        {roles.map(role => (
          <div key={role.id} className={styles.roleSection}>
            <div className={styles.roleHeader}>
              <span className={styles.roleName}>{role.name}</span>
              <span className={styles.roleCount}>{role.users.length}</span>
            </div>

            <div className={styles.usersList}>
              {role.users.map(user => (
                <div key={user.id} className={styles.userCard}>
                  <div className={styles.avatarContainer}>
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className={styles.avatar}
                    />
                    <div className={`${styles.statusIndicator} ${styles[user.status] || ''}`}></div>
                  </div>

                  <div className={styles.userInfo}>
                    <div className={styles.username}>{user.name}</div>
                    
                    {user.activity ? (
                      <>
                        <div className={styles.activity}>
                          {getActivityIcon(user.activity.type)}
                          <span className={styles.activityText}>{user.activity.details}</span>
                        </div>
                        {user.activity.lyrics && (
                          <div className={styles.lyrics}>
                            <MdMusicNote   className={styles.lyricsIndicator}/>
                            <span>"{user.activity.lyrics}"</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className={styles.statusText}>
                        {user.status === 'away' ? 'Currently away' : 'No activity'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VocentraUserCard;
