import React, { useState, useEffect, useRef } from "react";
import {
  FaHeart,
  FaSmile,
  FaPaperPlane,
  FaArrowUp,
  FaEllipsisV,
  FaBan,
  FaTrash,
  FaUnlock
} from "react-icons/fa";
import { MdAddBox } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
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
  setDoc,
  serverTimestamp,
  limit,
  startAfter,
  getDocs,
  endBefore
} from "firebase/firestore";

import EmojiPicker from "./ChatComponents/EmojiPicker";
import FileUploadModal from "./ChatComponents/FileUploadModal";
import Message from "./ChatComponents/Message";
import ImageModal from "./ChatComponents/ImageModal";
import { useMessagesStore } from "../../../Store/useMessagesStore";

// --- Confirmation Modal ---
const ConfirmationModal = ({ title, message, onConfirm, onCancel, confirmText = "Confirm", isDanger = false }) => (
  <div className={styles.modalOverlay}>
    <div className={styles.modalContent}>
      <h3>{title}</h3>
      <p>{message}</p>
      <div className={styles.modalActions}>
        <button className={styles.btnCancel} onClick={onCancel}>Cancel</button>
        <button 
          className={styles.btnConfirm} 
          onClick={onConfirm}
          style={{ backgroundColor: isDanger ? "#ff453a" : "#007bff" }}
        >
          {confirmText}
        </button>
      </div>
    </div>
  </div>
);

const Chat = ({ user, onBack }) => {
  const { currentUser: firebaseUser } = useAuth();
  const { currentUser: appUser } = useUser();
  
  // Zustand Store
  const { 
    conversationsCache, 
    setMessages, 
    prependMessages, 
    addMessage, // Bunu ekledik
    clearConversation 
  } = useMessagesStore();

  // Local State
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingOld, setFetchingOld] = useState(false);
  
  // UI States
  const [isHeartModeActive, setIsHeartModeActive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Block & Permission States
  const [blockStatus, setBlockStatus] = useState(null); 
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  
  // Listener Logic State
  const [latestDocLoaded, setLatestDocLoaded] = useState(null);

  const [confirmAction, setConfirmAction] = useState(null);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const menuRef = useRef(null);

  const getConversationId = (user1Id, user2Id) => {
    if (!user1Id || !user2Id) return null;
    return [user1Id, user2Id].sort().join("_");
  };

  const conversationId = appUser?.uid && user?.uid ? getConversationId(appUser.uid, user.uid) : null;
  const cachedData = conversationsCache[conversationId] || { messages: [], lastDoc: null, hasMore: true };
  const messages = cachedData.messages;

  // --- 1. Initial Status Check & First Load (10 Messages) ---
  useEffect(() => {
    if (!conversationId || !appUser?.uid || !user?.uid) return;

    const initChat = async () => {
      // Cache boşsa loading göster
      if (messages.length === 0) setLoading(true);
      
      try {
        // A) Backend Status Check (Hafif)
        const idToken = await firebaseUser.getIdToken();
        const statusRes = await fetch(`${process.env.REACT_APP_API_URL}/api/messages/${conversationId}/status`, {
           headers: { Authorization: `Bearer ${idToken}` }
        });
        
        if (statusRes.ok) {
           const data = await statusRes.json();
           setBlockStatus(data.blockStatus);
           if (data.blockStatus) {
               setLoading(false);
               return; 
           }
        }

        // B) İlk 10 Mesajı Çek (GET - Snapshot Değil)
        // Bu sayede "pencere kayması" olmaz. İlk 10'u sabitleriz.
        const qInitial = query(
            collection(db, "conversations", conversationId, "messages"),
            orderBy("createdAt", "desc"),
            limit(10) // Sadece ilk 10 mesaj
        );

        const snapshot = await getDocs(qInitial);
        
        if (!snapshot.empty) {
            const fetchedMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse();
            const lastDoc = snapshot.docs[snapshot.docs.length - 1]; // En eski (pagination için)
            const firstDoc = snapshot.docs[0]; // En yeni (listener referansı için)

            setMessages(conversationId, fetchedMessages, lastDoc, true);
            setLatestDocLoaded(firstDoc);
        } else {
            // Hiç mesaj yoksa boş set et
            setMessages(conversationId, [], null, false);
            setLatestDocLoaded(null); 
        }
        
        setInitialCheckDone(true);

      } catch (error) {
        console.error("Init Error:", error);
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [conversationId, user.uid]);


  // --- 2. Realtime Listener (Sadece YENİ Mesajlar İçin) ---
  useEffect(() => {
    if (!conversationId || !initialCheckDone || blockStatus) return;

    // Eğer daha önce hiç mesaj yoksa, şimdiden sonrasını dinle
    // Eğer mesaj varsa, en son çektiğimiz mesajdan (latestDocLoaded) sonrasını dinle.
    let qListener;

    if (latestDocLoaded) {
        // latestDocLoaded'dan "önce" (tarih olarak daha yeni) olanları getir.
        // Descending sıralamada 'endBefore' demek, o tarihten daha büyük (yeni) tarihli dokümanlar demektir.
        qListener = query(
            collection(db, "conversations", conversationId, "messages"),
            orderBy("createdAt", "desc"),
            endBefore(latestDocLoaded) 
        );
    } else {
        // Mesaj yoksa hepsini dinle (zaten yeni gelecek)
        qListener = query(
            collection(db, "conversations", conversationId, "messages"),
            orderBy("createdAt", "desc")
        );
    }

    const unsubscribe = onSnapshot(qListener, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
                // Yeni mesaj geldi -> Store'a EKLE (Replace yapma)
                const newMsg = { id: change.doc.id, ...change.doc.data() };
                // Kendi mesajımızsa ve zaten optimistik olarak eklediysek dublike olmaması için store kontrol eder
                addMessage(conversationId, newMsg);
                
                // Referans noktasını güncellemeye gerek yok, listener zaten dinamik çalışır
            }
        });
    }, (err) => console.log("Listener Error", err));

    return () => unsubscribe();
  }, [conversationId, initialCheckDone, latestDocLoaded, blockStatus]);


  // --- 3. Pagination (Load More - Eskiler) ---
  const loadMoreMessages = async () => {
    if (!cachedData.hasMore || fetchingOld || !cachedData.lastDoc) return;
    setFetchingOld(true);
    
    try {
      const q = query(
        collection(db, "conversations", conversationId, "messages"),
        orderBy("createdAt", "desc"),
        startAfter(cachedData.lastDoc),
        limit(15)
      );
      
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const newMsgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse();
        const lastVisible = snapshot.docs[snapshot.docs.length - 1];
        prependMessages(conversationId, newMsgs, lastVisible, true);
      } else {
        setMessages(conversationId, messages, cachedData.lastDoc, false);
      }
    } catch (err) {
      console.error("Load more error:", err);
    } finally {
      setFetchingOld(false);
    }
  };

  // --- 4. Scroll Handling ---
  const handleScroll = (e) => {
    if (e.target.scrollTop === 0 && cachedData.hasMore && !fetchingOld && messages.length >= 10) {
      loadMoreMessages();
    }
  };

  useEffect(() => {
    if (messagesEndRef.current && !fetchingOld) {
       messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    }
    if (fetchingOld && chatContainerRef.current) {
        chatContainerRef.current.scrollTop = 50;
    }
  }, [messages, fetchingOld]);


  // --- 5. Actions ---
  const handleBlockUser = async () => {
      setConfirmAction(null);
      try {
          const idToken = await firebaseUser.getIdToken();
          const res = await fetch(`${process.env.REACT_APP_API_URL}/api/users/block/${user.uid}`, {
              method: "POST",
              headers: { Authorization: `Bearer ${idToken}` }
          });
          if (res.ok) {
              setBlockStatus("blocking");
              setMenuOpen(false);
          }
      } catch (error) { console.error(error); }
  };

  const handleUnblockUser = async () => {
    setConfirmAction(null);
    try {
        const idToken = await firebaseUser.getIdToken();
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/users/unblock/${user.uid}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${idToken}` }
        });
        if (res.ok) {
            setBlockStatus(null);
            setMenuOpen(false);
            setInitialCheckDone(false); // Tekrar yüklemesi için trigger
        }
    } catch (error) { console.error(error); }
  };

  const handleClearChat = async () => {
    setConfirmAction(null);
    if (!conversationId) return;
    try {
        const idToken = await firebaseUser.getIdToken();
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/messages/${conversationId}/clear`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${idToken}` }
        });
        if (res.ok) {
            clearConversation(conversationId);
            setMenuOpen(false);
        }
    } catch (error) { console.error(error); }
  };

  // --- 6. Send Message ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (blockStatus || message.trim() === "") return;

    const tempMessage = message.trim();
    setMessage("");
    setIsHeartModeActive(false);
    setShowEmojiPicker(false);

    try {
      const idToken = await firebaseUser.getIdToken();
      const endpoint = isHeartModeActive 
        ? `${process.env.REACT_APP_API_URL}/api/messages/heart`
        : `${process.env.REACT_APP_API_URL}/api/messages/message`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ receiverUid: user.uid, text: tempMessage }),
      });

      const data = await res.json();
      if (!res.ok && data.blockStatus) setBlockStatus(data.blockStatus);
      
      // Not: Mesaj başarılıysa zaten listener (onSnapshot) yakalayıp ekrana basacaktır.
    } catch (error) {
      console.error("Send error:", error);
      setMessage(tempMessage);
    }
  };

  const handleSendFile = async (file, fileName) => {
      try {
        const idToken = await firebaseUser.getIdToken();
        const formData = new FormData();
        formData.append("file", file);
        formData.append("conversationId", conversationId);
        formData.append("fromId", appUser.uid);
        formData.append("toId", user.uid);
        formData.append("messageType", "Dosya");
        formData.append("fileName", fileName);

        await fetch(`${process.env.REACT_APP_API_URL}/api/messages/file`, {
            method: "POST",
            headers: { Authorization: `Bearer ${idToken}` },
            body: formData
        });
        setIsModalOpen(false);
      } catch (error) { console.error(error); }
  };

  // Click outside menu
  useEffect(() => {
      const handleClickOutside = (event) => {
          if (menuRef.current && !menuRef.current.contains(event.target)) {
              setMenuOpen(false);
          }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.Chat}>
      {isModalOpen && <FileUploadModal onClose={() => setIsModalOpen(false)} onUpload={handleSendFile} />}
      {isImageModalOpen && <ImageModal src={selectedImageSrc} onClose={() => setIsImageModalOpen(false)} />}
      
      {confirmAction && (
          <ConfirmationModal 
             title={confirmAction.type === 'block' ? "Block User?" : confirmAction.type === 'unblock' ? "Unblock User?" : "Clear Chat?"}
             message={confirmAction.type === 'block' ? `Block ${user.displayName}?` : confirmAction.type === 'unblock' ? `Unblock ${user.displayName}?` : "Delete all messages?"}
             confirmText={confirmAction.type === 'block' ? "Block" : confirmAction.type === 'unblock' ? "Unblock" : "Delete"}
             isDanger={confirmAction.type !== 'unblock'}
             onConfirm={() => {
                 if(confirmAction.type === 'block') handleBlockUser();
                 else if(confirmAction.type === 'unblock') handleUnblockUser();
                 else handleClearChat();
             }}
             onCancel={() => setConfirmAction(null)}
          />
      )}

      <div className={styles.chatHeader}>
        <div className={styles.headerLeft}>
            <button className={styles.backButton} onClick={onBack}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{width:24, height:24}}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back</span>
            </button>
            <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
                <img src={user?.photoURL || "/default-profile.png"} alt={user?.displayName} />
            </div>
            <div className={styles.userNameWrapper}>
                <h2>{user?.displayName || user?.username}</h2>
            </div>
            </div>
        </div>
        <div className={styles.headerRight} ref={menuRef}>
            <button className={styles.menuButton} onClick={() => setMenuOpen(!menuOpen)}><FaEllipsisV /></button>
            {menuOpen && (
                <div className={styles.dropdownMenu}>
                    {blockStatus === "blocking" ? (
                        <button className={styles.menuItem} onClick={() => setConfirmAction({type: 'unblock'})}><FaUnlock /> Unblock User</button>
                    ) : (
                        <button className={`${styles.menuItem} ${styles.danger}`} onClick={() => setConfirmAction({type: 'block'})}><FaBan /> Block User</button>
                    )}
                    <button className={`${styles.menuItem} ${styles.danger}`} onClick={() => setConfirmAction({type: 'clear'})}><FaTrash /> Clear Chat</button>
                </div>
            )}
        </div>
      </div>

      {blockStatus ? (
          <div className={styles.blockedContainer}>
             <FaBan className={styles.blockedIcon} />
             <p className={styles.blockedText}>{blockStatus === "blocking" ? "You blocked this user." : "You are blocked."}</p>
             {blockStatus === "blocking" && <button className={styles.unblockBtnMain} onClick={() => setConfirmAction({type: 'unblock'})}>Unblock</button>}
          </div>
      ) : (
          <div className={styles.chatBox} ref={chatContainerRef} onScroll={handleScroll}>
            <div className={styles.messages}>
            {fetchingOld && <div className={styles.loadingOld}><FaArrowUp className={styles.spinning} /> Loading history...</div>}
            {loading && messages.length === 0 ? (
                <p className={styles.loadingMessage}>Loading...</p>
            ) : messages.length > 0 ? (
                messages.map((msg) => (
                <Message key={msg.id} msg={msg} isSender={msg.senderId === appUser?.uid} user={user} appUser={appUser} onImageClick={(src) => {setSelectedImageSrc(src); setIsImageModalOpen(true);}} />
                ))
            ) : (
                <p className={styles.noMessages}>No messages yet.</p>
            )}
            <div ref={messagesEndRef} />
            </div>
        </div>
      )}

      {!blockStatus && (
        <form className={styles.messageInputWrapper} onSubmit={handleSendMessage}>
          <div className={styles.messageInputContainer}>
            <input type="text" placeholder={isHeartModeActive ? "Heart message..." : "Type a message..."} value={message} onChange={(e) => setMessage(e.target.value)} className={styles.textInput} />
            <div className={styles.iconGroupRight}>
              <FaHeart className={`${styles.rightIconHeart} ${isHeartModeActive ? styles.activeHeart : ""}`} onClick={() => setIsHeartModeActive(!isHeartModeActive)} />
              <FaSmile className={styles.rightIcon} onClick={() => setShowEmojiPicker(!showEmojiPicker)} />
              <button type="submit" className={styles.sendButton} disabled={message.trim() === ""}><FaPaperPlane /></button>
            </div>
          </div>
          {showEmojiPicker && <div className={styles.emojiPickerWrapper}><EmojiPicker onSelect={(e) => setMessage(prev => prev + e.native)} isVisible={showEmojiPicker} /></div>}
        </form>
      )}
    </div>
  );
};

export default Chat;