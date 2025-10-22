// src/components/Chat/Chat.jsx

import React, { useState, useEffect, useRef } from "react";
import {
  FaHeart,
  FaSmile,
  FaPaperPlane,
  FaMicrophone,
  FaLock,
} from "react-icons/fa";
import { MdAddBox } from "react-icons/md";
import styles from "./Chat.module.css";
import { useAuth } from "../../../context/AuthProvider";
import { useUser } from "../../../context/UserContext";
import { db } from "../../../config/firebase-client";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  where,
  getDocs,
} from "firebase/firestore";

import EmojiPicker from "./ChatComponents/EmojiPicker";
import FileUploadModal from "./ChatComponents/FileUploadModal";
import Message from "./ChatComponents/Message";
import ImageModal from "./ChatComponents/ImageModal";

const Chat = ({ user, onBack }) => {
  const { currentUser: firebaseUser } = useAuth();
  const { currentUser: appUser } = useUser();

  // State tanımlamaları
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isHeartModeActive, setIsHeartModeActive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState(null);
  const messagesEndRef = useRef(null);
  const [recipientSettings, setRecipientSettings] = useState(null);
  const [canSendMessage, setCanSendMessage] = useState(false);
  const [checkingPermissions, setCheckingPermissions] = useState(true);

  const getConversationId = (user1Id, user2Id) => {
    if (!user1Id || !user2Id) return null;
    return [user1Id, user2Id].sort().join("_");
  };
  const conversationId =
    appUser?.uid && user?.uid ? getConversationId(appUser.uid, user.uid) : null;

  // Gerçek zamanlı mesaj dinleyici
  useEffect(() => {
    if (!conversationId) {
      setLoading(false);
      setMessages([]);
      return;
    }

    const initConversation = async () => {
      try {
        const conversationRef = doc(db, "conversations", conversationId);
        const docSnap = await getDoc(conversationRef);

        // Eğer daha önce konuşma yoksa oluştur
        if (!docSnap.exists()) {
          await import("firebase/firestore").then(
            ({ setDoc, serverTimestamp }) =>
              setDoc(conversationRef, {
                members: [appUser.uid, user.uid],
                createdAt: serverTimestamp(),
                lastMessage: null,
              })
          );
        }

        // Sohbet mevcutsa dinlemeye başla
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
            console.error("Mesajları getirme hatası:", error);
            setLoading(false);
          }
        );

        return unsubscribe;
      } catch (error) {
        console.error("Sohbet oluşturma hatası:", error);
        setLoading(false);
      }
    };

    setLoading(true);
    initConversation();
  }, [conversationId]);

  // İzin kontrolü useEffect ('following' case'i kaldırıldı)
  useEffect(() => {
    const checkPermissions = async () => {
      if (!appUser?.uid || !user?.uid || appUser.uid === user.uid) {
        setCanSendMessage(false);
        setCheckingPermissions(false);
        return;
      }
      setCheckingPermissions(true);
      try {
        const recipientDocRef = doc(db, "users", user.uid);
        const recipientDocSnap = await getDoc(recipientDocRef);
        if (!recipientDocSnap.exists()) {
          setCanSendMessage(false);
          setRecipientSettings(null);
          return;
        }
        const recipientData = recipientDocSnap.data();
        const settings = recipientData.privacySettings?.messages || "everyone";
        setRecipientSettings(settings);

        let permissionGranted = false;
        switch (settings) {
          case "everyone":
            permissionGranted = true;
            break;
          case "no":
            permissionGranted = false;
            break;
          case "followers": // Ben onu takip ediyor muyum?
            const q1 = query(
              collection(db, "follows"),
              where("followerUid", "==", appUser.uid),
              where("followingUid", "==", user.uid),
              where("status", "==", "following")
            );
            const snap1 = await getDocs(q1);
            permissionGranted = !snap1.empty;
            break;
          case "closeFriends":
            const cfRef = doc(
              db,
              "users",
              user.uid,
              "closeFriends",
              appUser.uid
            );
            const cfSnap = await getDoc(cfRef);
            permissionGranted = cfSnap.exists();
            break;
          default:
            permissionGranted = false;
        }
        setCanSendMessage(permissionGranted);
      } catch (error) {
        console.error("İzin kontrol hatası:", error);
        setCanSendMessage(false);
      } finally {
        setCheckingPermissions(false);
      }
    };
    checkPermissions();
  }, [user, appUser]);

  // Scroll useEffect
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Mesaj gönderme fonksiyonu (GÜNCELLENDİ)
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!canSendMessage || message.trim() === "" || !conversationId) {
      if (isHeartModeActive) setIsHeartModeActive(false);
      return;
    }
    try {
      const idToken = await firebaseUser.getIdToken();

      let endpoint = "";
      let messagePayload = {};

      // --- YENİ EKLENEN KOŞUL BLOKU ---
      if (isHeartModeActive) {
        // Kalp modu aktifse, 'sendHeartMessage' endpoint'ini çağır
        // (Bu rotanın backend'de 'sendHeartMessage' fonksiyonuna bağlı olduğunu varsayıyoruz)
        endpoint = `${process.env.REACT_APP_API_URL}/api/messages/heart`;
        messagePayload = {
          receiverUid: user.uid,
          text: message.trim(), // Backend'deki 'sendHeartMessage' text alabiliyor
        };
      } else {
        // Kalp modu aktif değilse, normal 'sendMessage' endpoint'ini çağır
        endpoint = `${process.env.REACT_APP_API_URL}/api/messages/message`;
        messagePayload = {
          receiverUid: user.uid,
          text: message.trim(),
        };
      }
      // --- DEĞİŞİKLİK SONU ---

      // Dinamik endpoint ve payload ile fetch işlemi
      await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(messagePayload),
      });

      // Durumu sıfırla
      setMessage("");
      setIsHeartModeActive(false);
    } catch (error) {
      console.error("Mesaj gönderme hatası:", error);
    }
  };

  // Diğer handle fonksiyonları
  const handleHeartClick = () => setIsHeartModeActive((prev) => !prev);
  const handleEmojiSelect = (emoji) => {
    setMessage((prev) => prev + emoji.native);
    setShowEmojiPicker(false);
  };
  const handleImageClick = (src) => {
    setSelectedImageSrc(src);
    setIsImageModalOpen(true);
  };
  const handleSendFile = async (file, fileName, messageType) => {
    /* ... */
  }; // Bu fonksiyon değişmedi

  // İzin durumu mesajı ('following' case'i kaldırıldı)
  const getPermissionMessage = () => {
    if (checkingPermissions) return "İzinler kontrol ediliyor...";
    if (appUser?.uid === user?.uid) return "Kendinize mesaj gönderemezsiniz.";
    if (canSendMessage) return null;
    switch (recipientSettings) {
      case "no":
        return "Bu kullanıcı kimseden mesaj kabul etmiyor.";
      case "followers":
        return "Bu kullanıcı sadece takip ettiği kişilerden mesaj alıyor.";
      case "closeFriends":
        return "Bu kullanıcı sadece yakın arkadaşlarından mesaj alıyor.";
      default:
        return "Bu kullanıcıya mesaj gönderemezsiniz.";
    }
  };
  const permissionMessage = getPermissionMessage();

  return (
    <div className={styles.Chat}>
      {isModalOpen && (
        <FileUploadModal
          onClose={() => setIsModalOpen(false)}
          onUpload={(file, fileName) => handleSendFile(file, fileName, "file")}
        />
      )}
      {isImageModalOpen && (
        <ImageModal
          src={selectedImageSrc}
          onClose={() => setIsImageModalOpen(false)}
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className={styles.backBtnSpan}>Geri</span>
        </button>
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>
            <img
              src={user?.photoURL || "/default-profile.png"}
              alt={user?.displayName || user?.username}
            />
          </div>
          <div className={styles.userNameWrapper}>
            <h2>{user?.displayName || user?.username || "Kullanıcı"}</h2>
          </div>
        </div>
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
                isSender={msg.senderId === appUser?.uid}
                user={user}
                appUser={appUser}
                onImageClick={handleImageClick}
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
      {permissionMessage ? (
        <div className={styles.permissionDenied}>
          <FaLock /> {permissionMessage}
        </div>
      ) : (
        <form
          className={styles.messageInputWrapper}
          onSubmit={handleSendMessage}
        >
          <div className={styles.messageInputContainer}>
            <MdAddBox
              className={styles.inputIconLeft}
              onClick={() => canSendMessage && setIsModalOpen(true)}
              style={{
                pointerEvents: !canSendMessage ? "none" : "auto",
                opacity: !canSendMessage ? 0.5 : 1,
                cursor: canSendMessage ? "pointer" : "default",
              }}
            />
            <input
              type="text"
              placeholder={
                isHeartModeActive ? "Kalpli mesajınız..." : "Bir mesaj yazın..."
              }
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={styles.textInput}
              disabled={!canSendMessage || checkingPermissions}
            />
            <div className={styles.iconGroupRight}>
              <FaHeart
                className={`${styles.rightIconHeart} ${
                  isHeartModeActive ? styles.activeHeart : ""
                }`}
                onClick={() => canSendMessage && handleHeartClick()}
                style={{
                  pointerEvents: !canSendMessage ? "none" : "auto",
                  opacity: !canSendMessage ? 0.5 : 1,
                  cursor: canSendMessage ? "pointer" : "default",
                }}
              />
              <FaSmile
                className={styles.rightIcon}
                onClick={() =>
                  canSendMessage && setShowEmojiPicker(!showEmojiPicker)
                }
                style={{
                  pointerEvents: !canSendMessage ? "none" : "auto",
                  opacity: !canSendMessage ? 0.5 : 1,
                  cursor: canSendMessage ? "pointer" : "default",
                }}
              />
              <button
                type="submit"
                className={styles.sendButton}
                disabled={
                  !canSendMessage ||
                  message.trim() === "" ||
                  checkingPermissions
                }
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
          {showEmojiPicker && canSendMessage && (
            <div className={styles.emojiPickerWrapper}>
              <EmojiPicker
                onSelect={handleEmojiSelect}
                isVisible={showEmojiPicker}
              />
            </div>
          )}
        </form>
      )}
    </div>
  );
};

export default Chat;