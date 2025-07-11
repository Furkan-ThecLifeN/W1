// components/UserProfileCard.jsx
import React from 'react';
import styles from './UserProfileCard.module.css';

const UserProfileCard = ({ user }) => {
  if (!user) return null;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <img src={user.avatar} alt={user.name} className={styles.avatar} />
        <h2 className={styles.name}>{user.name}</h2>
      </div>

      <div className={styles.stats}>
        <div>
          <strong>{user.posts}</strong>
          <span>Gönderi</span>
        </div>
        <div>
          <strong>{user.followers}</strong>
          <span>Takipçi</span>
        </div>
        <div>
          <strong>{user.following}</strong>
          <span>Takip</span>
        </div>
      </div>

      <div className={styles.bio}>
        <p>{user.bio}</p>
      </div>
    </div>
  );
};

export default UserProfileCard;
