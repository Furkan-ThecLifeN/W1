import React from 'react';
import styles from './ChatHeader.module.css';
import { FiPhone, FiVideo } from 'react-icons/fi';

const ChatHeader = ({ user }) => {
  return (
    <div className={styles.header}>
      <div className={styles.userInfo}>
        <img src={user.avatar} alt={user.name} />
        <div>
          <h3>{user.name}</h3>
          <p>{user.online ? 'Online' : 'Offline'}</p>
        </div>
      </div>
      <div className={styles.actions}>
        <FiPhone />
        <FiVideo />
      </div>
    </div>
  );
};

export default ChatHeader;
