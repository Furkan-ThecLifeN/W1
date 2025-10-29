import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../config/firebase-client';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);

      // --- GÜNCELLENMİŞ YÖNLENDİRME ---
      const currentPath = window.location.pathname;

      if (user) {
        // Kullanıcı giriş yapmışsa ve auth/login sayfasındaysa, /home'a yönlendir
        if (currentPath === '/auth' || currentPath === '/login') {
          navigate('/home', { replace: true });
        }
      } else {
        // Kullanıcı giriş yapmamışsa
        const publicPaths = [
          '/',
          '/auth',
          '/login', // /login'i public listeye ekle
          '/home',
          '/discover',
          '/data-discover',
          '/post', // /post/ID şeklinde çalışması için startsWith kullanılmalı
          '/profile', // /profile/username şeklinde çalışması için
          '/search'
        ];

        // Bulunduğu yol izin verilenlerden biri mi?
        const isPublic = publicPaths.some(path =>
          currentPath.startsWith(path)
        );

        if (!isPublic) {
          // Korumalı bir sayfadaysa /auth'a (veya /login) yönlendir
          navigate('/auth', { replace: true });
        }
      }
      // --- GÜNCELLEME SONU ---
    });

    return unsubscribe;
  }, [navigate]);

  const showToast = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage({ text: '', type: '' });
    }, 4000);
  };

  const value = {
    currentUser,
    loading,
    message,
    showToast,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};