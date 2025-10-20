// src/pages/AuthPage/AuthPage.jsx

import React, { useState } from "react";
import LoginForm from "../../components/Auth/LoginForm";
import RegisterForm from "../../components/Auth/RegisterForm";
import ForgotPasswordForm from "../../components/Auth/ForgotPasswordForm"; // Yeni eklendi
import styles from "./AuthPage.module.css"; // Tamamen yeni stil dosyası

const AuthPage = () => {
  // 'login', 'register', 'forgot' durumlarını yönetmek için state güncellendi
  const [view, setView] = useState("login");

  const renderForm = () => {
    switch (view) {
      case "login":
        return (
          <LoginForm
            onShowRegister={() => setView("register")}
            onShowForgotPassword={() => setView("forgot")}
          />
        );
      case "register":
        return (
          <RegisterForm
            onRegisterSuccess={() => setView("login")} // Kayıt sonrası girişe yönlendir
            onShowLogin={() => setView("login")}
          />
        );
      case "forgot":
        return (
          <ForgotPasswordForm 
            onShowLogin={() => setView("login")} 
          />
        );
      default:
        return (
          <LoginForm
            onShowRegister={() => setView("register")}
            onShowForgotPassword={() => setView("forgot")}
          />
        );
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.leftPanel}>
        <div className={styles.logo}>W1</div>
        <div className={styles.welcomeText}>
          <h1>Topluluğa tekrar hoş geldin!</h1>
          <p>
            Anılarını paylaş, ilham al ve yeni bağlantılar kur. Harika bir
            deneyim seni bekliyor.
          </p>
        </div>
      </div>

      <div className={styles.rightPanel}>
        {/* Formlar arası geçişte animasyon olması için bir sarmalayıcı */}
        <div className={styles.formWrapper} key={view}>
          {renderForm()}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;