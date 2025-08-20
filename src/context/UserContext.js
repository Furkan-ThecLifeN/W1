// src/context/UserContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import { auth } from "../config/firebase-client";
import { useAuth } from "./AuthProvider"; // ✅ YENİ: showToast için AuthProvider'ı import edin

const UserContext = createContext();

const defaultUser = {
  uid: null,
  username: "",
  displayName: "",
  email: "",
  bio: "",
  photoURL:
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
  familySystem: null,
  accountType: "personal",
  stats: {
    posts: 0,
    rta: 0,
    followers: 0,
    following: 0,
  },
  privacySettings: {
    messages: "everyone",
    storyReplies: true,
  },
};

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useAuth(); // ✅ YENİ: showToast'u kullanmak için

  // Auth state değişikliğini dinle ve kullanıcı verilerini backend'den al
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          const res = await fetch(
            `${process.env.REACT_APP_API_URL}/api/auth/profile`,
            {
              headers: {
                Authorization: `Bearer ${idToken}`,
              },
            }
          );

          if (res.ok) {
            const { profile } = await res.json();
            setCurrentUser({ ...defaultUser, ...profile });
          } else {
            console.error("Kullanıcı profili alınamadı.");
            setCurrentUser(null);
          }
        } catch (error) {
          console.error("Kullanıcı profili alınırken hata:", error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ✅ Gizlilik ayarlarını güncelleyen fonksiyon
  const updatePrivacySettings = async (settings) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/users/privacy/${settings.type}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(settings.data),
        }
      );

      if (!response.ok) {
        throw new Error("Gizlilik ayarları güncellenirken hata oluştu.");
      }

      const updatedSettings = await response.json();
      console.log("Ayarlar başarıyla güncellendi:", updatedSettings);

      // Local state'i güncelle
      setCurrentUser((prevUser) => ({
        ...prevUser,
        privacySettings: {
          ...prevUser.privacySettings,
          ...settings.data,
        },
      }));

      return true;
    } catch (error) {
      console.error("Gizlilik ayarlarını güncelleme hatası:", error);
      showToast("Gizlilik ayarları güncellenirken hata oluştu.", "error"); // ✅ Hata mesajı eklendi
      return false;
    }
  };

  // ✅ YENİ: Giriş yapılan cihaz bilgilerini kaydetme fonksiyonu
  const saveLoginDevice = async (deviceInfo) => {
    try {
      const idToken = await auth.currentUser.getIdToken();
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/users/devices/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(deviceInfo),
      });

      if (!res.ok) {
        throw new Error("Cihaz bilgileri kaydedilemedi.");
      }
      const data = await res.json();
      console.log("Cihaz bilgileri kaydedildi:", data);
    } catch (error) {
      console.error("Cihaz bilgisi kaydetme hatası:", error);
      showToast("Giriş cihazı kaydedilirken hata oluştu.", "error");
    }
  };

  const value = {
    currentUser,
    setCurrentUser,
    loading,
    defaultUser,
    updatePrivacySettings,
    saveLoginDevice, // ✅ Yeni fonksiyon context'e eklendi
  };

  return (
    <UserContext.Provider value={value}>
      {!loading && children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};