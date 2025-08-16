// src/components/Auth/LoginForm.js

import React, { useState } from 'react';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../config/firebase-client';
import { useAuth } from '../../context/AuthProvider';
import styles from './AuthForms.module.css';
import { useNavigate } from 'react-router-dom';
import LoadingOverlay from '../LoadingOverlay/LoadingOverlay';

const isValidEmailFormat = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const LoginForm = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [identifierError, setIdentifierError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ showMessage yerine showToast kullanıyoruz
  const { showToast } = useAuth();
  const navigate = useNavigate();

  const handleIdentifierChange = (e) => {
    setIdentifier(e.target.value);
    setIdentifierError('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    let hasError = false;
    if (!identifier) { setIdentifierError('Lütfen email veya kullanıcı adınızı girin.'); hasError = true; }
    if (!password) { setPasswordError('Lütfen şifrenizi girin.'); hasError = true; }

    if (hasError) {
      // ✅ Hata mesajını doğru formatta gönderin
      showToast('Lütfen tüm alanları doldurun.', 'error');
      return;
    }
    
    setLoading(true);

    try {
      let resolvedEmail = identifier;
      if (!isValidEmailFormat(identifier)) {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/resolve-identifier`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Kullanıcı bulunamadı.');
        }
        resolvedEmail = data.email;
      }

      const userCred = await signInWithEmailAndPassword(auth, resolvedEmail, password);
      const idToken = await userCred.user.getIdToken();

      // ✅ YENİ: Giriş yapılan cihaz bilgilerini kaydet
      await fetch(`${process.env.REACT_APP_API_URL}/api/auth/devices/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          ip: 'IP_ADRESI', // IP adresini backend'den al
          device: navigator.userAgent,
          os: navigator.platform,
          browser: navigator.userAgent
        }),
      });

      const profileRes = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/profile`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${idToken}` }
      });

      if (!profileRes.ok) {
        const err = await profileRes.json();
        throw new Error(err.error || 'Profil alınamadı');
      }

      const profileData = await profileRes.json();
      // ✅ Başarılı mesajı doğru formatta gönderin
      showToast(`Giriş başarılı. Hoş geldin ${profileData.profile.displayName || userCred.user.email}`, 'success');

      setIdentifier('');
      setPassword('');
      setIdentifierError('');
      setPasswordError('');
      navigate('/home');

    } catch (err) {
      let errorMessage = 'Giriş hatası.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errorMessage = 'Geçersiz email/kullanıcı adı veya şifre.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Geçersiz e-posta formatı.';
      } else {
        errorMessage = `Giriş hatası: ${err.message}`;
      }
      // ✅ Hata mesajını doğru formatta gönderin
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/google-signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: idToken })
      });

      const data = await res.json();
      if (!res.ok) {
        // ✅ Hata mesajını doğru formatta gönderin
        showToast(data.error || 'Google ile giriş başarısız.', 'error');
        await auth.signOut();
      } else {
        // ✅ Başarılı mesajı doğru formatta gönderin
        showToast(`Google ile giriş başarılı! Hoş geldin ${data.user.displayName || data.user.email}`, 'success');
        navigate('/home');
      }
    } catch (error) {
      console.error('Google Sign-In Hatası:', error);
      let errorMessage = 'Google ile giriş sırasında bir hata oluştu:';
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Google giriş penceresi kapatıldı.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Aynı anda birden fazla giriş isteği algılandı.';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'Bu e-posta adresiyle başka bir kimlik doğrulama yöntemiyle zaten hesap var.';
      } else {
        errorMessage = `Google ile giriş sırasında bir hata oluştu: ${error.message}`;
      }
      // ✅ Hata mesajını doğru formatta gönderin
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <LoadingOverlay />}
      <form onSubmit={handleLogin} className={styles.auth_form_container}>
        <h2>Giriş Yap</h2>
        <label>Email veya Kullanıcı Adı</label>
        <input type="text" required value={identifier} onChange={handleIdentifierChange} placeholder="Email veya Kullanıcı Adı" />
        {identifierError && <span className={styles.error_text}>{identifierError}</span>}
        <label>Şifre</label>
        <input type="password" required value={password} onChange={handlePasswordChange} placeholder="********" />
        {passwordError && <span className={styles.error_text}>{passwordError}</span>}
        <button type="submit">Giriş Yap</button>
        <div className={styles.or_separator}><hr /><span>VEYA</span><hr /></div>
        <button type="button" onClick={handleGoogleSignIn} className={styles.google_signin_button}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png" alt="Google Logo" className={styles.google_logo} />
          Google ile Giriş Yap
        </button>
      </form>
    </>
  );
};

export default LoginForm;