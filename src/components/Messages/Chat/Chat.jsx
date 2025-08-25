// src/components/Chat/Chat.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  FaHeart,
  FaSmile,
  FaPaperPlane,
  FaMicrophone,
} from "react-icons/fa";
import { MdAddBox } from "react-icons/md";
import styles from "./Chat.module.css";
import { useAuth } from "../../../context/AuthProvider";
import { useUser } from "../../../context/UserContext";

// ✅ Firestore bağlantısı
import { db } from "../../../config/firebase-client";

// ✅ Firestore metodları
import {
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

import EmojiPicker from "./ChatComponents/EmojiPicker";
import FileUploadModal from "./ChatComponents/FileUploadModal";
import Message from "./ChatComponents/Message";

const Chat = ({ user, onBack }) => {
  const { currentUser: firebaseUser } = useAuth();
  const { currentUser: appUser } = useUser();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // ❤️ Kalp modu
  const [isHeartModeActive, setIsHeartModeActive] = useState(false);

  const messagesEndRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const getConversationId = (user1Id, user2Id) => {
    return [user1Id, user2Id].sort().join("_");
  };
  const conversationId = getConversationId(appUser.uid, user.uid);

  // 🔄 Gerçek zamanlı mesaj dinleyici
  useEffect(() => {
    if (!appUser?.uid || !user?.uid) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const messagesRef = query(
      collection(db, "conversations", conversationId, "messages"),
      orderBy("createdAt")
    );

    const unsubscribe = onSnapshot(
      messagesRef,
      (querySnapshot) => {
        const fetchedMessages = [];
        querySnapshot.forEach((doc) => {
          fetchedMessages.push({ id: doc.id, ...doc.data() });
        });
        setMessages(fetchedMessages);
        setLoading(false);
      },
      (error) => {
        console.error("Gerçek zamanlı mesajları getirme hatası:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [conversationId, appUser?.uid, user?.uid]);

  // 📌 Mesaj geldiğinde aşağı kaydır
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // 📝 Mesaj gönderme
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (message.trim() === "") {
      // Eğer kalp modu aktifse ve input boşsa → modu kapat
      if (isHeartModeActive) {
        setIsHeartModeActive(false);
      }
      return;
    }

    try {
      const idToken = await firebaseUser.getIdToken();

      let messagePayload;
      if (isHeartModeActive) {
        // ❤️ Kalp modu aktifse
        messagePayload = {
          receiverUid: user.uid,
          text: message,
          type: "heart",
        };
        await fetch(`${process.env.REACT_APP_API_URL}/api/messages/heart`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify(messagePayload),
        });
      } else {
        // ✉️ Normal mesaj
        messagePayload = {
          receiverUid: user.uid,
          text: message,
        };
        await fetch(`${process.env.REACT_APP_API_URL}/api/messages/message`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify(messagePayload),
        });
      }

      setMessage(""); // input temizle
      setIsHeartModeActive(false); // ❤️ modu kapat
    } catch (error) {
      console.error("Mesaj gönderme hatası:", error);
    }
  };

  // ❤️ Kalp butonu tıklanınca modu aç/kapat
  const handleHeartClick = () => {
    setIsHeartModeActive((prev) => !prev);
  };

  // 😀 Emoji seç
  const handleEmojiSelect = (emoji) => {
    setMessage((prev) => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  // 🎙️ Ses kaydı
  const handleVoiceRecord = async () => {
    if (isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.addEventListener("dataavailable", (event) => {
          audioChunksRef.current.push(event.data);
        });

        mediaRecorderRef.current.addEventListener("stop", async () => {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
          });
          await handleSendFile(
            audioBlob,
            `sesli_mesaj_${Date.now()}.webm`,
            1
          );
          stream.getTracks().forEach((track) => track.stop());
        });

        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Ses kaydı başlatılamadı:", error);
      }
    }
  };

  // 📎 Dosya gönder
  const handleSendFile = async (file, fileName, expirationHours) => {
    try {
      const idToken = await firebaseUser.getIdToken();
      const formData = new FormData();
      formData.append("file", file, fileName);
      formData.append("receiverUid", user.uid);
      formData.append("expirationHours", expirationHours);

      await fetch(`${process.env.REACT_APP_API_URL}/api/messages/file`, {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
        body: formData,
      });

      console.log("Dosya gönderme başarılı.");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Dosya gönderme hatası:", error);
    }
  };

  return (
    <div className={styles.Chat}>
      {isModalOpen && (
        <FileUploadModal
          onClose={() => setIsModalOpen(false)}
          onUpload={handleSendFile}
        />
      )}
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className={styles.backBtnSpan}>Geri</span>
        </button>
        <h2>{user?.displayName || user?.username}</h2>
      </div>

      <div className={styles.chatBox}>
        <div className={styles.messages}>
          {loading ? (
            <p className={styles.loadingMessage}>Mesajlar yükleniyor...</p>
          ) : messages.length > 0 ? (
            messages.map((msg) => (
              <Message
                key={msg.id}
                msg={msg}
                isSender={msg.senderId === appUser.uid}
                user={user}
                appUser={appUser}
              />
            ))
          ) : (
            <p className={styles.noMessages}>
              Henüz bu kullanıcıyla mesajınız yok.
            </p>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form className={styles.messageInputWrapper} onSubmit={handleSendMessage}>
        <div className={styles.messageInputContainer}>
          <MdAddBox
            className={styles.inputIconLeft}
            onClick={() => setIsModalOpen(true)}
          />

          <input
            type="text"
            placeholder={
              isHeartModeActive ? "Kalpli mesajınız..." : "Bir mesaj yazın..."
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={styles.textInput}
          />

          <div className={styles.iconGroupRight}>
            <FaHeart
              className={`${styles.rightIconHeart} ${
                isHeartModeActive ? styles.activeHeart : ""
              }`}
              onClick={handleHeartClick}
            />
            <FaSmile
              className={styles.rightIcon}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            />
            <button
              type="button"
              className={
                isRecording
                  ? styles.iconButtonMicRecording
                  : styles.iconButtonMic
              }
              aria-label="Ses gönder"
              onClick={handleVoiceRecord}
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
        {showEmojiPicker && <EmojiPicker onSelect={handleEmojiSelect} />}
      </form>
    </div>
  );
};

export default Chat;
