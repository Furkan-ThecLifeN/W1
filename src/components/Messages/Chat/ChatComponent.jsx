import React from 'react';
import styles from './ChatComponent.module.css';
import StoryBar from '../../StoryBar/StoryBar';

const ChatComponent = () => {
  return (
    <div className={styles.chatContainer}>
      <div className={styles.logoArea}>
        <h1 className={styles.logoText}>W1</h1>
      </div>

      <div className={styles.storyArea}>
        <StoryBar />
      </div>

      <div className={styles.messageArea}>
        <div className={styles.placeholder}>
          <p>Henüz bir sohbet seçilmedi</p>
          <p>Lütfen bir sohbete tıklayın</p>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;
