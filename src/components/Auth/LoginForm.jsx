import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import AuthStyle from "./Auth.module.css";

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [unicode, setUnicode] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      // Firebase ile giriş yap
      const userCred = await signInWithEmailAndPassword(auth, email, password);

      // Email doğrulama kontrolü
      if (!userCred.user.emailVerified) {
        setMessage('Lütfen önce e-posta doğrulamasını yapın.');
        return;
      }

      // Token al
      const idToken = await userCred.user.getIdToken();

      // Backend profil isteği (örnek, backend'de /api/auth/profile endpoint'in olmalı)
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/profile`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${idToken}` }
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Profil alınamadı');
      }

      const data = await res.json();
      setMessage('Giriş başarılı. Hoş geldin ' + (data.profile.firstname || userCred.user.email));
      // Burada global state veya yönlendirme yapılabilir

    } catch (err) {
      setMessage('Giriş hatası: ' + err.message);
    }
  };

  return (
    <form className={AuthStyle.auth_form} onSubmit={handleLogin}>
      <h2>Sign in</h2>

      <label>User name</label>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label>Password</label>
      <input
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <label>Unicode</label>
      <input
        type="password"
        value={unicode}
        onChange={(e) => setUnicode(e.target.value)}
      />

      <button type="submit">Giriş Yap</button>

      {message && <p>{message}</p>}
    </form>
  );
};

export default LoginForm;
