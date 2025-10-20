// src/components/Auth/LoginForm.jsx

import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../../config/firebase-client";
import { useAuth } from "../../context/AuthProvider";
import { useUser } from "../../context/UserContext";
import styles from "./AuthForms.module.css"; // Yeni form stilleri
import { useNavigate } from "react-router-dom";
import LoadingOverlay from "../LoadingOverlay/LoadingOverlay";
import { FiMail, FiLock } from "react-icons/fi"; // İkonlar eklendi

const isValidEmailFormat = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// onShowRegister ve onShowForgotPassword prop'ları eklendi
const LoginForm = ({ onShowRegister, onShowForgotPassword }) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // Tek bir genel hata state'i
  const [loading, setLoading] = useState(false);

  const { showToast } = useAuth();
  const { saveLoginDevice } = useUser();
  const navigate = useNavigate();

  const handleIdentifierChange = (e) => {
    setIdentifier(e.target.value);
    setError("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!identifier || !password) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }

    setLoading(true);

    try {
      let resolvedEmail = identifier;
      if (!isValidEmailFormat(identifier)) {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/auth/resolve-identifier`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifier }),
          }
        );
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Kullanıcı bulunamadı.");
        }
        resolvedEmail = data.email;
      }

      const userCred = await signInWithEmailAndPassword(
        auth,
        resolvedEmail,
        password
      );

      const deviceInfo = {
        device: navigator.userAgent,
        os: navigator.platform,
        browser: navigator.userAgent,
      };
      await saveLoginDevice(deviceInfo);

      showToast(
        `Giriş başarılı. Hoş geldin ${
          userCred.user.displayName || userCred.user.email
        }`,
        "success"
      );
      navigate("/home");
    } catch (err) {
      let errorMessage = "Giriş hatası.";
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        errorMessage = "Geçersiz email/kullanıcı adı veya şifre.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Geçersiz e-posta formatı.";
      } else {
        errorMessage = `Giriş hatası: ${err.message}`;
      }
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    // ... (Mevcut handleGoogleSignIn fonksiyonunuzun tamamı) ...
    // ... (Bu fonksiyonun içeriği aynı kalacak) ...
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const deviceInfo = {
        device: navigator.userAgent,
        os: navigator.platform,
        browser: navigator.userAgent,
      };
      await saveLoginDevice(deviceInfo);

      showToast(
        `Google ile giriş başarılı! Hoş geldin ${
          result.user.displayName || result.user.email
        }`,
        "success"
      );
      navigate("/home");
    } catch (error) {
      let errorMessage = "Google ile giriş sırasında bir hata oluştu:";
      if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Google giriş penceresi kapatıldı.";
      } else if (error.code === "auth/cancelled-popup-request") {
        errorMessage = "Aynı anda birden fazla giriş isteği algılandı.";
      } else if (
        error.code === "auth/account-exists-with-different-credential"
      ) {
        errorMessage =
          "Bu e-posta adresiyle başka bir kimlik doğrulama yöntemiyle zaten hesap var.";
      } else {
        errorMessage = `Google ile giriş sırasında bir hata oluştu: ${error.message}`;
      }
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <LoadingOverlay />}
      <form onSubmit={handleLogin} className={styles.auth_form_container}>
        <h2>Giriş Yap</h2>
        {error && <span className={styles.error_text_general}>{error}</span>}
        
        <div className={styles.input_group}>
          <FiMail className={styles.input_icon} />
          <input
            type="text"
            required
            value={identifier}
            onChange={handleIdentifierChange}
            placeholder="Email veya Kullanıcı Adı"
          />
        </div>

        <div className={styles.input_group}>
          <FiLock className={styles.input_icon} />
          <input
            type="password"
            required
            value={password}
            onChange={handlePasswordChange}
            placeholder="Şifre"
          />
        </div>

        <div className={styles.form_utils}>
          <span
            onClick={onShowForgotPassword} // Yeni prop'u kullan
            className={styles.toggle_link_inline}
          >
            Şifremi Unuttum
          </span>
        </div>

        <button type="submit" className={styles.submit_button}>
          Giriş Yap
        </button>
        <div className={styles.or_separator}>
          <hr />
          <span>VEYA</span>
          <hr />
        </div>
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className={styles.google_signin_button}
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png"
            alt="Google Logo"
            className={styles.google_logo}
          />
          Google ile Giriş Yap
        </button>

        <p className={styles.toggle_text}>
          Hesabın yok mu?{" "}
          <span onClick={onShowRegister} className={styles.toggle_link}>
            Kaydol
          </span>
        </p>
      </form>
    </>
  );
};

export default LoginForm;