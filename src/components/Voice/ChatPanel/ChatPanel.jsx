import React, { useState, useRef, useEffect } from 'react';
import { Send, X } from 'lucide-react';
import { useRTC } from '../../../context/RTCContext';
import styles from './ChatPanel.module.css';

const ChatPanel = ({ closeChat }) => {
  const { messages, sendMessage } = useRTC();
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span>Oda Sohbeti</span>
        <button onClick={closeChat} className={styles.closeButton}>
          <X size={20} />
        </button>
      </div>

      <div className={`${styles.messagesArea} voice-scrollbar`}>
        {messages.length === 0 && (
          <div className={styles.emptyMessage}>
            Henüz mesaj yok. İlk mesajı sen at! 👋
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={styles.messageRow}>
            <img src={msg.avatar || "https://via.placeholder.com/32"} className={styles.avatar} alt="avatar" />
            <div className={styles.msgContent}>
              <div className={styles.msgHeader}>
                <span className={styles.senderName}>{msg.sender}</span>
                <span className={styles.timestamp}>{msg.timestamp}</span>
              </div>
              <p className={styles.text}>{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className={styles.inputArea}>
        <form onSubmit={handleSend} className={styles.form}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Bir mesaj yaz..."
            className={styles.input}
          />
          <button type="submit" className={styles.sendButton}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;