// src/components/Auth/LoginForm.jsx

import React, { useState } from "react";
import {
  // signInWithEmailAndPassword, // <-- BU SİLİNDİ, ÇÜNKÜ KULLANMAYACAĞIZ
  signInWithCustomToken, // <-- BU EKLENDİ, ÇÜNKÜ BACKEND'DEN TOKEN ALACAĞIZ
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../../config/firebase-client";
import { useAuth } from "../../context/AuthProvider";
import { useUser } from "../../context/UserContext";
import styles from "./AuthForms.module.css";
import { useNavigate } from "react-router-dom";
import LoadingOverlay from "../LoadingOverlay/LoadingOverlay";
import { FiMail, FiLock } from "react-icons/fi";
import axios from "axios"; // <-- AXIOS EKLENDİ (veya fetch kullanıyorsanız ona göre düzeltin)

// Bu fonksiyon artık gerekli değil, backend e-posta veya kullanıcı adı olduğunu anlıyor
// const isValidEmailFormat = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const LoginForm = ({ onShowRegister, onShowForgotPassword }) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
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

  // --- Burası en önemli kısım, handleLogin fonksiyonu güncellendi ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!identifier || !password) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }

    setLoading(true);

    try {
      // 1. GİRİŞ İÇİN DOĞRUDAN BACKEND'İN /api/auth/login ENDPOINT'İNİ ÇAĞIR
      // Backend (authController.js) e-posta/kullanıcı adı ayrımını ve şifre kontrolünü yapacak
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/login`,
        { identifier, password }
      );

      // 2. BACKEND'DEN GELEN CUSTOM TOKEN'I AL
      const { token } = response.data;

      if (!token) {
        throw new Error("Giriş token'ı (jeton) alınamadı.");
      }

      // 3. FIREBASE'E CUSTOM TOKEN İLE GİRİŞ YAP
      // Bu, "Ben backend'imden onay aldım" demektir.
      const userCred = await signInWithCustomToken(auth, token);

      // 4. Cihaz bilgilerini kaydet (bu sizin kodunuzda vardı, iyi bir özellik)
      const deviceInfo = {
        device: navigator.userAgent,
        os: navigator.platform,
        browser: navigator.userAgent,
      };
      await saveLoginDevice(deviceInfo);

      // 5. Başarılı giriş ve yönlendirme
      showToast(
        `Giriş başarılı. Hoş geldin ${
          userCred.user.displayName || userCred.user.email
        }`,
        "success"
      );
      navigate("/home");
    } catch (err) {
      // Hata yönetimi de güncellendi
      console.error("Giriş hatası:", err);
      let errorMessage = "Giriş sırasında bilinmeyen bir hata oluştu.";

      // Hata backend'den (axios) geliyorsa (örn: 403 - Şifre yanlış)
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error; // "Geçersiz email/kullanıcı adı veya şifre."
      }
      // Hata Firebase'den (custom token) geliyorsa
      else if (err.code === "auth/custom-token-mismatch") {
        errorMessage = "Giriş token'ı geçersiz. Lütfen tekrar deneyin.";
      }
      // Diğer hatalar
      else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  // Google ile giriş fonksiyonunuz (handleGoogleSignIn) backend'inize
  // göre düzeltilmemiş, ancak o ayrı bir konu. Şimdilik ona dokunmadım.
  // E-posta/şifre girişini çözdükten sonra gerekirse ona da bakarız.
  const handleGoogleSignIn = async () => {
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

  // JSX (HTML) kısmında hiçbir değişiklik yok
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
            onClick={onShowForgotPassword}
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
          Hesabın yok mu?
          <span onClick={onShowRegister} className={styles.toggle_link}>
            Kaydol
          </span>
        </p>
      </form>
    </>
  );
};

export default LoginForm;
