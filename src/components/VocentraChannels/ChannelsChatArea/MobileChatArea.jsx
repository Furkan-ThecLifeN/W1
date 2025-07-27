import React, { useState, useRef, useEffect } from "react";
import {
  FaBell,
  FaThumbtack,
  FaPaperPlane,
  FaSmile,
  FaMicrophone,
  FaBars,
  FaUserFriends,
} from "react-icons/fa";
import styles from "./MobileChatArea.module.css";
import { MdAddBox } from "react-icons/md";
import MobileChannelSidebar from "../ChannelSidebar/MobileChannelSidebar";
import MobileVocentraUserCard from "./../VocentraUserCard/MobileVocentraUserCard";

const MobileChatArea = ({ channel, setActiveTextChannel }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      user: {
        id: 1,
        name: "John Doe",
        avatar: "https://i.pravatar.cc/150?img=1",
        color: "#00bbff",
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
        color: "#ff0088",
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
        color: "#d0ff00",
      },
      content: "I can help in about an hour if that works?",
      timestamp: "12:35 PM",
    },
  ]);
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const [activeMobileView, setActiveMobileView] = useState(null);
  const messagesEndRef = useRef(null);

  const channelsexample = {
    text: [
      { id: 1, name: "welcome" },
      { id: 2, name: "general" },
      { id: 3, name: "announcements" },
      { id: 4, name: "rules" },
    ],
    voice: [
      { id: 5, name: "Genel Ses", users: 5, maxUsers: 10 },
      { id: 6, name: "Müzik Odası", users: 2, maxUsers: 5 },
      { id: 7, name: "Oyun Odası", users: 8, maxUsers: 12 },
    ],
  };

  // İlk yüklemede varsayılan kanal seçilsin
  useEffect(() => {
    if (!channel && setActiveTextChannel) {
      const defaultChannel = channelsexample.text[0];
      setActiveTextChannel(defaultChannel);
    }
  }, [channel, setActiveTextChannel]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      user: {
        id: 3,
        name: "You",
        avatar: "https://i.pravatar.cc/150?img=3",
        color: "#01bff9",
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

  // Kanal adı ya seçilen kanaldan ya da varsayılan ilk kanaldan gelsin
  const displayChannelName = channel?.name || channelsexample.text[0].name;

  const openView = (view) => {
    setActiveMobileView(view);
    setShowMobilePanel(true);
  };

  return (
    <div className={styles.chatArea}>
      {showMobilePanel && (
        <div className={styles.mobileOverlay}>
          <div className={styles.mobilePanelContent}>
            {activeMobileView === "sidebar" && (
              <MobileChannelSidebar
                channels={channelsexample}
                setActiveTextChannel={(channel) => {
                  setActiveTextChannel(channel);
                  setShowMobilePanel(false);
                  setActiveMobileView(null);
                }}
                activeTextChannel={channel}
                onClose={() => {
                  setShowMobilePanel(false);
                  setActiveMobileView(null);
                }}
              />
            )}
            {activeMobileView === "rightPanel" && (
              <div className={styles.rightPanelContent}>
                <MobileVocentraUserCard
                  onClose={() => {
                    setShowMobilePanel(false);
                    setActiveMobileView(null);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <div className={styles.chatHeader}>
        <div className={styles.channelInfo}>
          <button
            className={styles.mobileMenuButton}
            onClick={() => openView("sidebar")}
            aria-label="Menüyü aç"
          >
            <FaBars />
          </button>
          <h2>{displayChannelName}</h2>
        </div>

        <div className={styles.chatActions}>
          <button
            className={styles.mobilePanelToggle}
            onClick={() => openView("rightPanel")}
            aria-label="Üye panelini aç"
          >
            <FaUserFriends />
          </button>
          <button className={styles.actionButton} aria-label="Bildirimler">
            <FaBell />
          </button>
          <button className={styles.actionButton} aria-label="Sabitlenen Mesajlar">
            <FaThumbtack />
          </button>
        </div>
      </div>

      {!showMobilePanel && (
        <>
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
                placeholder={`#${displayChannelName} kanalına mesaj yaz`}
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
        </>
      )}
    </div>
  );
};

export default MobileChatArea;
