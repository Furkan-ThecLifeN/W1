// src/components/Auth/RegisterForm.js
import React, { useState } from 'react';
import { useAuth } from '../../AuthProvider';
import styles from './AuthForms.module.css';
import LoadingOverlay from '../LoadingOverlay/LoadingOverlay'; // Yükleyiciyi import ediyoruz

// Client-side validasyon regex'leri
const isValidEmailFormat = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidUsernameFormat = (username) => /^[a-z0-9_.]{3,15}$/.test(username);
const isValidPasswordFormat = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]).{8,}$/.test(password);

const RegisterForm = ({ onRegisterSuccess }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [emailError, setEmailError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [loading, setLoading] = useState(false); // Yeni loading state'i

  const { showMessage } = useAuth();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError(e.target.value && !isValidEmailFormat(e.target.value) ? 'Lütfen geçerli bir e-posta adresi girin.' : '');
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    setUsernameError(e.target.value && !isValidUsernameFormat(e.target.value) ? 'Kullanıcı adı sadece küçük harf, rakam, alt çizgi (_) ve nokta (.) içermeli, 3-15 karakter olmalıdır.' : '');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError(e.target.value && !isValidPasswordFormat(e.target.value) ? 'Şifre en az 8 karakter, 1 büyük harf, 1 küçük harf, 1 rakam ve 1 özel karakter içermelidir.' : '');
    if (confirmPassword && e.target.value !== confirmPassword) {
      setConfirmPasswordError('Şifreler eşleşmiyor.');
    } else if (confirmPassword && e.target.value === confirmPassword) {
      setConfirmPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    setConfirmPasswordError(e.target.value && e.target.value !== password ? 'Şifreler eşleşmiyor.' : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let hasError = false;
    if (!email || !isValidEmailFormat(email)) { setEmailError('Geçerli bir e-posta adresi gerekli.'); hasError = true; }
    if (!username || !isValidUsernameFormat(username)) { setUsernameError('Geçerli bir kullanıcı adı gerekli.'); hasError = true; }
    if (!password || !isValidPasswordFormat(password)) { setPasswordError('Geçerli bir şifre gerekli.'); hasError = true; }
    if (password !== confirmPassword) { setConfirmPasswordError('Şifreler eşleşmiyor.'); hasError = true; }

    if (hasError) {
      showMessage('error', 'Lütfen tüm alanları doğru ve eksiksiz doldurun.');
      return;
    }

    setLoading(true); // İşlem başlarken yükleyiciyi göster

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, displayName, password, confirmPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        showMessage('error', data.error || 'Kayıt sırasında bir hata oluştu.');
      } else {
        showMessage('success', 'Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
        if (onRegisterSuccess) { onRegisterSuccess(); }
        setEmail(''); setEmailError('');
        setUsername(''); setUsernameError('');
        setDisplayName('');
        setPassword(''); setPasswordError('');
        setConfirmPassword(''); setConfirmPasswordError('');
      }
    } catch (error) {
      showMessage('error', `İstek gönderilirken hata oluştu: ${error.message}`);
    } finally {
      setLoading(false); // İşlem bitince yükleyiciyi gizle
    }
  };

  return (
    <>
      {loading && <LoadingOverlay />} {/* LoadingOverlay'i koşullu olarak render et */}
      <form onSubmit={handleSubmit} className={styles.auth_form_container}>
        <h2>Kayıt Ol</h2>
        <label>Email</label>
        <input type="email" value={email} onChange={handleEmailChange} placeholder="email@example.com" required />
        {emailError && <span className={styles.error_text}>{emailError}</span>}
        <label>Kullanıcı Adı</label>
        <input type="text" value={username} onChange={handleUsernameChange} placeholder="benzersiz_kullanici" required />
        {usernameError && <span className={styles.error_text}>{usernameError}</span>}
        <label>Görünen İsim (Opsiyonel)</label>
        <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Furkan Yılmaz" />
        <span className={styles.error_text}></span>
        <label>Şifre</label>
        <input type="password" value={password} onChange={handlePasswordChange} placeholder="********" required />
        {passwordError && <span className={styles.error_text}>{passwordError}</span>}
        <label>Şifreyi Onayla</label>
        <input type="password" value={confirmPassword} onChange={handleConfirmPasswordChange} placeholder="********" required />
        {confirmPasswordError && <span className={styles.error_text}>{confirmPasswordError}</span>}
        <button type="submit">Kayıt Ol</button>
      </form>
    </>
  );
};

export default RegisterForm;