import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      // Artık burada emailVerified kontrolü veya yönlendirme yok.
      // Sadece kullanıcı durumunu ayarlıyoruz.
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

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
