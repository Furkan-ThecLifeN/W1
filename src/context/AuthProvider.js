// AuthProvider.js

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../config/firebase.js';
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
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      setLoading(false);

      if (user) {
        // Kullanıcı giriş yapmışsa ve auth sayfasındaysa home'a yönlendir
        if (window.location.pathname === '/auth') {
          navigate('/home', { replace: true });
        }
      } else {
        // Kullanıcı oturumu kapalıysa ve home'da değilse auth sayfasına yönlendir
        if (window.location.pathname !== '/auth' && window.location.pathname !== '/') {
          navigate('/auth', { replace: true });
        }
      }
    });
    return unsubscribe;
  }, [navigate]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 4000);
  };

  const value = {
    currentUser,
    loading,
    message,
    showMessage
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};