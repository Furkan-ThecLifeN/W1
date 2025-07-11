import React, { useState, useRef, useEffect } from 'react';
import styles from './ChatWindow.module.css';
import { IoIosSend, IoMdAttach, IoMdHappy } from 'react-icons/io';
import { BsMicFill } from 'react-icons/bs';
import EmojiPicker from 'emoji-picker-react';

export default function ChatWindow({ currentUser }) {
  const [messages, setMessages] = useState([
    { id: 1, type: 'text', text: 'Merhaba, nasılsın?', sent: false },
    { id: 2, type: 'text', text: 'İyiyim, teşekkürler! Sen nasılsın?', sent: true },
    { id: 3, type: 'image', src: 'https://i.pinimg.com/736x/53/fc/43/53fc43878d52789e4d5a99fc07ece48e.jpg', sent: false },
    { id: 4, type: 'file', name: 'dokuman.pdf', sent: true },
    { id: 5, type: 'voice', duration: '0:15', sent: false },
    { id: 6, type: 'text', text: 'Görüşürüz!', sent: true },
  ]);
  const [text, setText] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [listening, setListening] = useState(false);
  const endRef = useRef(null);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

  const sendMessage = () => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), type: 'text', text, sent: true }]);
    setText(''); setShowPicker(false);
  };

  return (
    <div className={styles.chatWindow}>
      <div className={styles.messagesContainer}>
        {messages.map(m => (
          <div key={m.id} className={`${styles.messageRow} ${m.sent ? styles.sent : styles.received}`}>            
            {m.type === 'text' && (
              <div className={m.sent ? styles.bubbleSent : styles.bubbleReceived}>{m.text}</div>
            )}
            {m.type === 'image' && <img src={m.src} alt="img" className={styles.imageMessage} />}
            {m.type === 'file' && (
              <div className={styles.fileBubble}><span className={styles.fileIcon}>📄</span><span className={styles.fileName}>{m.name}</span></div>
            )}
            {m.type === 'voice' && (
              <div className={styles.voiceBubble}><span className={styles.voiceIcon}>🎤</span><span>{m.duration}</span></div>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {showPicker && (
        <div className={styles.emojiPicker}>
          <EmojiPicker onEmojiClick={(_, e) => setText(prev => prev + e.emoji)} />
        </div>
      )}

      <div className={styles.inputArea}>
        <div className={styles.leftIcons}>
          <IoMdHappy onClick={() => setShowPicker(v => !v)} />
        </div>
        <div className={styles.inputWrapper}>
          <input
            className={styles.inputField}
            placeholder="Mesaj yaz..."
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && sendMessage()}
          />
          <div className={styles.rightIcons}>
            <IoMdAttach />
            <BsMicFill onClick={() => setListening(v => !v)} className={listening ? styles.listening : ''} />
          </div>
          <button
            className={`${styles.sendInside} ${!text.trim() ? styles.disabled : ''}`}
            onClick={sendMessage}
            disabled={!text.trim()}
          >
            <IoIosSend />
          </button>
        </div>
      </div>
    </div>
  );
}