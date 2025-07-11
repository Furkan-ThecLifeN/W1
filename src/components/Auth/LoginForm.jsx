import React, { useState } from 'react';
import AuthStyle from "./Auth.module.css"

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Giriş Bilgileri:', { email, password });
  };

  return (
    <form className={AuthStyle.auth_form} onSubmit={handleLogin}>
      <h2>Sing in</h2>
      <label>User name</label>
      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      <label>Password</label>
      <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      <label>Unicode</label>
      <input type="password"/>
      
      <button type="submit">Giriş Yap</button>
    </form>
  );
};

export default LoginForm;
