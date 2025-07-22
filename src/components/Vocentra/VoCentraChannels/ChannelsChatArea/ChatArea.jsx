import React from 'react';
import styles from './ChatArea.module.css';

const ChatArea = ({ channel, messages }) => {
  return (
    <div className={styles.chatArea}>
      <div className={styles.channelHeader}>
        <div className={styles.channelInfo}>
          <span className={styles.channelPrefix}>#</span>
          <span className={styles.channelName}>{channel.name}</span>
          <div className={styles.channelTopic}>{channel.topic}</div>
        </div>
        <div className={styles.channelActions}>
          <button className={styles.actionButton}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>
        </div>
      </div>

      <div className={styles.messagesContainer}>
        {messages.map((message, index) => (
          <div key={index} className={styles.message}>
            <div className={styles.messageAvatar} style={{ backgroundImage: `url(${message.author.avatar})` }} />
            <div className={styles.messageContent}>
              <div className={styles.messageHeader}>
                <span className={styles.messageAuthor} style={{ color: message.author.roleColor }}>
                  {message.author.name}
                </span>
                <span className={styles.messageTime}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className={styles.messageText}>{message.text}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.messageInputContainer}>
        <div className={styles.inputWrapper}>
          <button className={styles.attachmentButton}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13h-4v4h-2v-4H7v-2h4V9h2v4h4v2z"/>
            </svg>
          </button>
          <input 
            type="text" 
            className={styles.messageInput}
            placeholder={`Mesaj gönder #${channel.name}`}
          />
          <div className={styles.inputButtons}>
            <button className={styles.inputButton}>
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5V8c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v4.5z"/>
              </svg>
            </button>
            <button className={styles.inputButton}>
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;