// src/components/Chat/Chat.jsx
import React, { useState, useEffect } from "react";
import {
  FaHeart,
  FaSmile,
  FaPaperPlane,
  FaMicrophone,
} from "react-icons/fa";
import { MdAddBox } from "react-icons/md";
import { AiFillFileAdd } from "react-icons/ai";
import styles from "./Chat.module.css";
import { useAuth } from "../../../context/AuthProvider";
import { useUser } from "../../../context/UserContext";

const Chat = ({ user, onBack }) => {
  const { currentUser: firebaseUser } = useAuth();
  const { currentUser: appUser } = useUser();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Konuşma ID'sini oluştur
  const getConversationId = (user1Id, user2Id) => {
    return [user1Id, user2Id].sort().join("_");
  };
  const conversationId = getConversationId(appUser.uid, user.uid);

  // Mesajları getir
  useEffect(() => {
    const fetchMessages = async () => {
      if (!appUser?.uid || !firebaseUser) return;
      setLoading(true);
      try {
        const idToken = await firebaseUser.getIdToken();
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/messages/${conversationId}`,
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );
        const data = await response.json();
        setMessages(data.messages);
      } catch (error) {
        console.error("Mesajları getirme hatası:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [conversationId, appUser?.uid, firebaseUser]);

  // Mesaj gönderme
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (message.trim() === "") return;

    try {
      const idToken = await firebaseUser.getIdToken();
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            receiverUid: user.uid,
            text: message,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Mesaj gönderilemedi.");
      }

      const sentMessageData = await response.json();
      setMessages((prev) => [...prev, sentMessageData.sentMessage]);
      setMessage("");
    } catch (error) {
      console.error("Mesaj gönderme hatası:", error);
    }
  };

  return (
    <div className={styles.Chat}>
      {/* Header */}
      <div className={styles.chatHeader}>
        <button className={styles.backButton} onClick={onBack}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            className={styles.backIcon}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className={styles.backBtnSpan}>Geri</span>
        </button>
        <h2>{user?.displayName || user?.username}</h2>
      </div>

      {/* Mesajlar */}
      <div className={styles.chatBox}>
        <div className={styles.messages}>
          {loading ? (
            <p className={styles.loadingMessage}>Mesajlar yükleniyor...</p>
          ) : messages.length > 0 ? (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`${styles.messageRow} ${
                  msg.senderUid === appUser.uid ? styles.right : styles.left
                }`}
              >
                {msg.senderUid !== appUser.uid && (
                  <img
                    src={user.photoURL}
                    alt={user.username}
                    className={styles.userAvatar}
                  />
                )}
                <div className={`${styles.messageBubble} ${styles.text}`}>
                  {msg.text}
                </div>
              </div>
            ))
          ) : (
            <p className={styles.noMessages}>
              Henüz bu kullanıcıyla mesajınız yok.
            </p>
          )}
        </div>
      </div>

      {/* Mesaj Input */}
      <form className={styles.messageInputWrapper} onSubmit={handleSendMessage}>
        <div className={styles.messageInputContainer}>
          <MdAddBox className={styles.inputIconLeft} />

          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={styles.textInput}
          />

          <div className={styles.iconGroupRight}>
            <FaHeart className={styles.rightIconHeart} />
            <FaSmile className={styles.rightIcon} />
            <button
              type="button"
              className={styles.iconButtonMic}
              aria-label="Ses gönder"
            >
              <FaMicrophone />
            </button>
            <button
              type="submit"
              className={styles.sendButton}
              disabled={message.trim() === ""}
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Chat;
