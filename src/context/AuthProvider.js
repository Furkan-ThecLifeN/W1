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

      if (user) {
        if (window.location.pathname === '/auth') {
          navigate('/home', { replace: true });
        }
      } else {
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

  // ✅ Toast mesajı gösterme fonksiyonu - Adı "showToast"
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
    showToast, // ✅ Burada doğru isimle ekleniyor
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};