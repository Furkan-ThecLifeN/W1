// LoginForm.js
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { useAuth } from '../../AuthProvider';
import styles from './AuthForms.module.css';
import { useNavigate } from 'react-router-dom';

// Client-side validasyon regex'i (email formatı için)
const isValidEmailFormat = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginForm = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [identifierError, setIdentifierError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { showMessage } = useAuth();
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
      showMessage('error', 'Lütfen tüm alanları doldurun.');
      return;
    }

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
          showMessage('error', data.error || 'Kullanıcı bulunamadı.');
          return;
        }
        resolvedEmail = data.email;
      }

      // Firebase Auth ile giriş yap
      const userCred = await signInWithEmailAndPassword(auth, resolvedEmail, password);

      // E-posta doğrulama kontrolü ve yönlendirme satırlarını bu kısımdan tamamen kaldırıyoruz.
      // if (!userCred.user.emailVerified) { ... }

      // Giriş başarılı, şimdi kullanıcı profilini al
      const idToken = await userCred.user.getIdToken();
      const profileRes = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/profile`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${idToken}` }
      });

      if (!profileRes.ok) {
        const err = await profileRes.json();
        throw new Error(err.error || 'Profil alınamadı');
      }

      const profileData = await profileRes.json();
      showMessage('success', `Giriş başarılı. Hoş geldin ${profileData.profile.displayName || userCred.user.email}`);

      // Giriş sonrası formları temizle ve hata mesajlarını sıfırla
      setIdentifier('');
      setPassword('');
      setIdentifierError('');
      setPasswordError('');

      // Başarılı girişte doğrudan /home sayfasına yönlendirme
      navigate('/home');

    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        showMessage('error', 'Geçersiz email/kullanıcı adı veya şifre.');
      } else if (err.message) {
        showMessage('error', `Giriş hatası: ${err.message}`);
      } else {
        showMessage('error', 'Beklenmeyen bir giriş hatası oluştu.');
      }
    }
  };

  return (
    <form onSubmit={handleLogin} className={styles.auth_form_container}>
      <h2>Giriş Yap</h2>
      <label>Email veya Kullanıcı Adı</label>
      <input
        type="text"
        required
        value={identifier}
        onChange={handleIdentifierChange}
        placeholder="Email veya Kullanıcı Adı"
      />
      {identifierError && <span className={styles.error_text}>{identifierError}</span>}

      <label>Şifre</label>
      <input
        type="password"
        required
        value={password}
        onChange={handlePasswordChange}
        placeholder="********"
      />
      {passwordError && <span className={styles.error_text}>{passwordError}</span>}

      <button type="submit">Giriş Yap</button>
    </form>
  );
};

export default LoginForm;