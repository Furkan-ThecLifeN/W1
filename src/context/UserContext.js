// src/context/UserContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '../config/firebase-client';

const UserContext = createContext();

const defaultUser = {
  uid: null,
  username: '',
  displayName: '',
  email: '',
  bio: '',
  photoURL: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png', // Varsayılan profil fotoğrafı
  familySystem: null, // Aile sistemi
  accountType: 'personal', // ✅ YENİ: Hesap türü
  stats: {
    posts: 0,
    rta: 0,
    followers: 0,
    following: 0,
  },
};

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auth state değişikliğini dinle ve kullanıcı verilerini backend'den al
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // Kullanıcı giriş yapmışsa backend'den profilini çek
        try {
          const idToken = await firebaseUser.getIdToken();
          const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${idToken}`,
            },
          });

          if (res.ok) {
            const { profile } = await res.json();
            setCurrentUser({ ...defaultUser, ...profile });
          } else {
            console.error('Kullanıcı profili alınamadı.');
            setCurrentUser(null);
          }
        } catch (error) {
          console.error('Kullanıcı profili alınırken hata:', error);
          setCurrentUser(null);
        }
      } else {
        // Kullanıcı çıkış yapmışsa state'i sıfırla
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, loading, defaultUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};