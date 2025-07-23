import React from 'react';
import styles from './VocentraUserCard.module.css';

const VocentraUserCard = ({ users, roles }) => {
  const getRoleColor = (roleName) => {
    const role = roles.find(r => r.name === roleName);
    return role ? role.color : '#7289da';
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'busy':
        return styles.busy;
      case 'active':
        return styles.active;
      default:
        return styles.inactive;
    }
  };

  return (
    <div className={styles.userCardsContainer}>
      {users.map((user) => (
        <div 
          key={user.id} 
          className={`${styles.userCard} ${getStatusClass(user.status)}`}
          style={{
            '--role-color': getRoleColor(user.role)
          }}
        >
          <div className={styles.userAvatar}>
            <img src={user.avatar} alt={user.name} />
            <div className={`${styles.statusIndicator} ${styles[user.status]}`} />
          </div>
          
          <div className={styles.userInfo}>
            <div className={styles.userName} style={{ color: getRoleColor(user.role) }}>
              {user.name}
              {user.badge && <span className={styles.userBadge}>{user.badge}</span>}
            </div>
            <div className={styles.userRole}>{user.role}</div>
            
            <div className={styles.userActivity}>
              {user.activity.type === 'music' && (
                <>
                  <span className={styles.activityIcon}>🎵</span>
                  {user.activity.title}
                </>
              )}
              {user.activity.type === 'game' && (
                <>
                  <span className={styles.activityIcon}>🎮</span>
                  {user.activity.game} ({user.activity.duration})
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VocentraUserCard;