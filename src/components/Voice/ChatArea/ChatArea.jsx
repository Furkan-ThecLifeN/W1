import React, { useState, useEffect, useRef } from "react";
import {
  FaHashtag,
  FaPaperPlane,
  FaSmile,
  FaEllipsisV,
  FaHeart,
  FaFlag,
} from "react-icons/fa";
import styles from "./ChatArea.module.css";

const ChatArea = ({ channelName }) => {
  const [inputValue, setInputValue] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Menü durumu
  const messagesEndRef = useRef(null);
  const menuRef = useRef(null); // Dışarı tıklamayı algılamak için

  // Mock Data
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "Ghost",
      color: "#cacacaff",
      content:
        "Sunucu bağlantılarını kontrol ettim. Ping değerleri 20ms'in altında. ⚡",
      timestamp: "10:42 AM",
    },
    {
      id: 2,
      sender: "You",
      color: "#cacacaff",
      content: "Süper. Yeni güncellemeyi o zaman yayına alabiliriz.",
      timestamp: "10:43 AM",
    },
    {
      id: 3,
      sender: "Cipher",
      color: "#cacacaff",
      content: "Tasarım gerçekten sade ve şık duruyor. Eline sağlık! 🔥",
      timestamp: "10:50 AM",
    },
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMsg = {
      id: messages.length + 1,
      sender: "You",
      color: "#ffffff",
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages([...messages, newMsg]);
    setInputValue("");
  };

  const handleHeart = () => {
    setInputValue((prev) => prev + " ❤️");
  };

  const handleReport = () => {
    alert("Kanal şikayet edildi!"); // Buraya kendi mantığını ekleyebilirsin
    setIsMenuOpen(false);
  };

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Menü dışına tıklanınca kapatma
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.chatContainer}>
      {/* --- FLOATING HEADER --- */}
      <div className={styles.headerWrapper}>
        <div className={styles.floatingHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <FaHashtag />
            </div>
            <div className={styles.headerInfo}>
              <h1 className={styles.channelTitle}>
                {channelName || "Select a channel"}
              </h1>
              <span className={styles.channelDesc}>Digital void.</span>
            </div>
          </div>

          {/* Header Actions & Dropdown */}
          <div className={styles.headerActions} ref={menuRef}>
            <button
              className={styles.iconBtn}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <FaEllipsisV />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className={styles.dropdownMenu}>
                <button className={styles.reportBtn} onClick={handleReport}>
                  <FaFlag className={styles.reportIcon} /> Şikayet Et
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- MESSAGE FEED --- */}
      <div className={styles.feedArea}>
        <div className={styles.spacer}></div>
        {messages.map((msg) => {
          const isMe = msg.sender === "You";
          return (
            <div
              key={msg.id}
              className={`${styles.messageRow} ${
                isMe ? styles.myMessage : styles.peerMessage
              }`}
            >
              <div className={styles.messageBubble}>
                {!isMe && (
                  <div className={styles.messageHeader}>
                    <span
                      className={styles.sender}
                      style={{ color: msg.color }}
                    >
                      {msg.sender}
                    </span>
                  </div>
                )}

                <p className={styles.text}>{msg.content}</p>
                <span className={styles.time}>{msg.timestamp}</span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* --- INPUT AREA --- */}
      <div className={styles.inputArea}>
        <form className={styles.inputCapsule} onSubmit={handleSendMessage}>
          <input
            type="text"
            className={styles.realInput}
            placeholder={`Message #${channelName}`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />

          <div className={styles.rightActions}>
            <button
              type="button"
              className={styles.actionBtn}
              onClick={handleHeart}
            >
              <FaHeart className={styles.heartIcon} />
            </button>
            <button type="button" className={styles.actionBtn}>
              <FaSmile />
            </button>
            <button
              type="submit"
              className={`${styles.sendBtn} ${!inputValue && styles.disabled}`}
            >
              <FaPaperPlane />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatArea;
