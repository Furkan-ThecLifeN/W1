import React, { useState, useRef, useEffect } from "react";
import {
  FaHashtag,
  FaBell,
  FaThumbtack,
  FaUsers,
  FaPaperPlane,
  FaSmile,
  FaMicrophone,
  FaPlus,
  FaFileImage,
  FaPaperclip,
} from "react-icons/fa";

import styles from "./ChatArea.module.css";
import { MdAddBox } from "react-icons/md";

const ChatArea = ({ channelName = "general", channel }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      user: {
        id: 1,
        name: "John Doe",
        avatar: "https://i.pravatar.cc/150?img=1",
        color: "#00bbffff",
      },
      content: "Hey everyone! How are you doing today?",
      timestamp: "12:30 PM",
    },
    {
      id: 2,
      user: {
        id: 2,
        name: "Jane Smith",
        avatar: "https://i.pravatar.cc/150?img=2",
        color: "#ff0088ff",
      },
      content: "Working on the new project. Anyone free to help?",
      timestamp: "12:32 PM",
    },
    {
      id: 3,
      user: {
        id: 1,
        name: "John Doe",
        avatar: "https://i.pravatar.cc/150?img=1",
        color: "#d0ff00ff",
      },
      content: "I can help in about an hour if that works?",
      timestamp: "12:35 PM",
    },
  ]);

  const messagesEndRef = useRef(null);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      user: {
        id: 3,
        name: "You",
        avatar: "https://i.pravatar.cc/150?img=3",
        color: "#01bff9ff",
      },
      content: message,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages([...messages, newMessage]);
    setMessage("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Kanal adı için güvenli erişim
  const displayChannelName = channel?.name || channelName;

  return (
    <div className={styles.chatArea}>
      {/* Header */}
      <div className={styles.chatHeader}>
        <div className={styles.channelInfo}>
          <h2>{displayChannelName}</h2>
        </div>

        <div className={styles.chatActions}>
          <button className={styles.actionButton} aria-label="Bildirimler">
            <FaBell />
          </button>
          <button
            className={styles.actionButton}
            aria-label="Sabitlenen Mesajlar"
          >
            <FaThumbtack />
          </button>
          <button className={styles.actionButton} aria-label="Kullanıcılar">
            <FaUsers />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className={styles.messagesContainer}>
        <div className={styles.messages}>
          {messages.map((msg) => (
            <div key={msg.id} className={styles.message}>
              <img
                src={msg.user.avatar}
                alt={msg.user.name}
                className={styles.avatar}
              />
              <div className={styles.messageContent}>
                <div className={styles.messageHeader}>
                  <span
                    className={styles.username}
                    style={{ color: msg.user.color }}
                  >
                    {msg.user.name}
                  </span>
                  <span className={styles.timestamp}>{msg.timestamp}</span>
                </div>
                <div className={styles.messageText}>{msg.content}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Updated Message Input */}
      <form onSubmit={handleSendMessage} className={styles.messageInputWrapper}>
        <div className={styles.messageInputContainer}>
          <button
            type="button"
            className={styles.inputIconLeft}
            aria-label="Yeni dosya ekle"
          >
            <MdAddBox />
          </button>

          <input
            type="text"
            placeholder={`Message #${displayChannelName}`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={styles.textInput}
          />

          <div className={styles.iconGroupRight}>
            <button
              type="button"
              className={styles.iconButtonMic}
              aria-label="Ses gönder"
            >
              <FaMicrophone />
            </button>

            <button type="button" className={styles.iconButton}>
              <FaSmile />
            </button>
            <button
              type="submit"
              className={styles.sendButton}
              disabled={!message.trim()}
              aria-label="Gönder"
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatArea;
