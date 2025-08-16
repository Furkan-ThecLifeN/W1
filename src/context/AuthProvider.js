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

  // ✅ Toast mesajı için state
  const [message, setMessage] = useState({ type: '', text: '' });

  const navigate = useNavigate();

  // 🔐 Kullanıcı state'ini dinle ve yönlendirmeleri yap
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);

      if (user) {
        // Kullanıcı giriş yapmışsa ve auth sayfasındaysa home'a yönlendir
        if (window.location.pathname === '/auth') {
          navigate('/home', { replace: true });
        }
      } else {
        // Kullanıcı çıkış yaptıysa, /auth dışında bir yerdeyse /auth'a yönlendir
        if (
          window.location.pathname !== '/auth' &&
          window.location.pathname !== '/'
        ) {
          navigate('/auth', { replace: true });
        }
      }
    });

    return unsubscribe;
  }, [navigate]);

  // ✅ Toast mesajı gösterme fonksiyonu
  const showToast = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage({ text: '', type: '' });
    }, 4000); // 4 saniye sonra temizle
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
