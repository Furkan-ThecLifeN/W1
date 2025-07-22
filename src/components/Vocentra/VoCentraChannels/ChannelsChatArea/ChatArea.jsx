import React, { useState, useRef, useEffect } from 'react';
import styles from './ChatArea.module.css';

const ChatArea = ({ channel, messages }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    
    // Mesaj gönderme işlemi burada olacak
    console.log('Mesaj gönderildi:', newMessage);
    setNewMessage('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={styles.chatContainer}>
      {/* Channel Header */}
      <div className={styles.channelHeader}>
        <div className={styles.channelInfo}>
          <span className={styles.channelType}>
            {channel?.type === 'voice' ? '🔊' : '#'}
          </span>
          <h2 className={styles.channelName}>{channel?.name || 'Kanal Seçilmedi'}</h2>
          {channel?.topic && (
            <div className={styles.channelTopic}>
              <span>{channel.topic}</span>
            </div>
          )}
        </div>
        <div className={styles.channelActions}>
          <button className={styles.actionButton}>
            <span className={styles.searchIcon}>🔍</span>
          </button>
          <button className={styles.actionButton}>
            <span className={styles.pinIcon}>📌</span>
          </button>
          <button className={styles.actionButton}>
            <span className={styles.membersIcon}>👥</span>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className={styles.messagesContainer}>
        {messages?.length > 0 ? (
          messages.map((message, index) => (
            <div key={index} className={styles.message}>
              <div className={styles.messageAvatar}>
                <img src={message.author.avatar} alt={message.author.name} />
              </div>
              <div className={styles.messageContent}>
                <div className={styles.messageHeader}>
                  <span className={styles.messageAuthor}>{message.author.name}</span>
                  <span className={styles.messageTime}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className={styles.messageText}>{message.text}</div>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIllustration}>💬</div>
            <h3 className={styles.emptyTitle}>
              {channel ? `#${channel.name} kanalına hoş geldiniz!` : 'Bir kanal seçin'}
            </h3>
            <p className={styles.emptyDescription}>
              {channel ? 'İlk mesajı sen göndererek sohbeti başlat!' : 'Sohbete başlamak için soldan bir kanal seçin'}
            </p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className={styles.messageInputContainer}>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`${channel ? `#${channel.name} kanalına mesaj gönder` : 'Bir kanal seçin'}`}
            className={styles.messageInput}
            disabled={!channel}
          />
          <div className={styles.inputActions}>
            <button type="button" className={styles.attachmentButton}>
              <span className={styles.attachmentIcon}>📎</span>
            </button>
            <button type="button" className={styles.emojiButton}>
              <span className={styles.emojiIcon}>😊</span>
            </button>
          </div>
        </div>
        <button 
          type="submit" 
          className={styles.sendButton}
          disabled={!newMessage.trim() || !channel}
        >
          Gönder
        </button>
      </form>
    </div>
  );
};

export default ChatArea;