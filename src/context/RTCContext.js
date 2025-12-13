import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
// DÜZELTME: useAuth yerine senin UserContext'inden dışarı açılan useUser'ı çağırıyoruz.
import { useUser } from '../context/UserContext'; 

const RTCContext = createContext();

export const useRTC = () => useContext(RTCContext);

export const RTCProvider = ({ children }) => {
  // DÜZELTME: useUser hook'unu kullanarak currentUser verisini alıyoruz
  const { currentUser } = useUser(); 
  
  // State Yönetimi
  const [peers, setPeers] = useState([]); // Odadaki diğer kullanıcılar
  const [messages, setMessages] = useState([]); // Chat mesajları
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeScreenStream, setActiveScreenStream] = useState(null); // Şu an paylaşılan ekran

  // ------------------------------------------
  // WebRTC & Sinyalizasyon Mock Fonksiyonları
  // ------------------------------------------

  const joinRoom = (roomId) => {
    if (!currentUser) return; // Kullanıcı verisi henüz yüklenmediyse dur
    console.log(`${currentUser.displayName} ${roomId} odasına bağlanıyor...`);
    // Firebase Realtime DB işlemleri buraya gelecek
  };

  const toggleMic = () => setIsMicOn(!isMicOn);
  
  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        setActiveScreenStream(stream);
        setIsScreenSharing(true);
        
        // Kullanıcı tarayıcı üzerinden "Paylaşımı Durdur" derse:
        stream.getVideoTracks()[0].onended = () => {
          stopScreenShare();
        };
      } catch (err) {
        console.error("Ekran paylaşımı iptal edildi", err);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    if (activeScreenStream) {
      activeScreenStream.getTracks().forEach(track => track.stop());
    }
    setActiveScreenStream(null);
    setIsScreenSharing(false);
  };

  const sendMessage = (text) => {
    if (!currentUser) return;

    const newMsg = {
      id: Date.now(),
      sender: currentUser.displayName || currentUser.username || "Anonim", // İsim yoksa username veya Anonim kullan
      avatar: currentUser.photoURL,
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    // Önce kendi ekranımıza ekle
    setMessages((prev) => [...prev, newMsg]);
    // Sonra DataChannel üzerinden diğerlerine gönder...
  };

  const value = {
    peers,
    messages,
    isMicOn,
    toggleMic,
    isScreenSharing,
    toggleScreenShare,
    activeScreenStream,
    sendMessage,
    joinRoom,
    currentUser // UI'da kullanmak için dışarı açıyoruz
  };

  return <RTCContext.Provider value={value}>{children}</RTCContext.Provider>;
};