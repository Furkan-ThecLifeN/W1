// src/components/Auth/ForgotPasswordForm.jsx

import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthProvider";
import styles from "./AuthForms.module.css";
import { FiMail, FiArrowLeft, FiHash, FiLock } from "react-icons/fi"; // Yeni ikonlar
import LoadingOverlay from "../LoadingOverlay/LoadingOverlay";

const ForgotPasswordForm = ({ onShowLogin }) => {
  // Akışın hangi aşamada olduğunu takip etmek için (request veya verify)
  const [step, setStep] = useState("request"); // 'request' | 'verify'
  
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // Kod gönderildi mesajı için
  
  const { showToast } = useAuth();

  // Adım 1: Sıfırlama Kodu İsteği
  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      // Backend'deki /forgot-password endpoint'ine istek at
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/forgot-password`,
        { email }
      );

      // Backend'den gelen mesajı göster (örn: "Eğer kayıtlıysa... gönderildi")
      setSuccessMessage(response.data.message);
      setStep("verify"); // İkinci aşamaya geç
      showToast(response.data.message, "success");

    } catch (err) {
      console.error("Şifre sıfırlama isteği hatası:", err);
      const errorMessage =
        err.response?.data?.error ||
        "İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  // Adım 2: Kodu Doğrula ve Şifreyi Sıfırla
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Backend'deki YENİ /reset-password endpoint'ine istek at
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/reset-password`,
        { email, code, newPassword }
      );

      showToast(
        "Şifreniz başarıyla güncellendi. Şimdi giriş yapabilirsiniz.",
        "success"
      );
      onShowLogin(); // Başarıdan sonra giriş ekranına dön

    } catch (err) {
      console.error("Şifre sıfırlama hatası:", err);
      const errorMessage =
        err.response?.data?.error ||
        "İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <LoadingOverlay />}

      {/* AŞAMA 1: E-posta isteme formu */}
      {step === "request" && (
        <form onSubmit={handleRequestCode} className={styles.auth_form_container}>
          <h2>Şifreni Sıfırla</h2>
          <p className={styles.form_description}>
            Hesabınıza bağlı e-posta adresini girin, size şifrenizi sıfırlamanız
            için 6 haneli bir kod göndereceğiz.
          </p>

          {error && <span className={styles.error_text_general}>{error}</span>}

          <div className={styles.input_group}>
            <FiMail className={styles.input_icon} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-posta adresiniz"
              required
            />
          </div>

          <button type="submit" className={styles.submit_button}>
            Sıfırlama Kodu Gönder
          </button>

          <div className={styles.toggle_text}>
            <span onClick={onShowLogin} className={styles.toggle_link}>
              <FiArrowLeft style={{ verticalAlign: "middle" }} /> Giriş Ekranına Dön
            </span>
          </div>
        </form>
      )}

      {/* AŞAMA 2: Kod ve Yeni Şifre formu */}
      {step === "verify" && (
        <form onSubmit={handleResetPassword} className={styles.auth_form_container}>
          <h2>Kodu Doğrula</h2>
          <p className={styles.form_description}>
            <strong>{email}</strong> adresine gönderilen 6 haneli kodu ve
            yeni şifrenizi girin.
          </p>

          {successMessage && !error && (
             <span className={styles.success_text_general}>{successMessage}</span>
          )}
          {error && <span className={styles.error_text_general}>{error}</span>}

          <div className={styles.input_group}>
            <FiHash className={styles.input_icon} />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="6 Haneli Kod"
              required
              maxLength={6}
            />
          </div>

          <div className={styles.input_group}>
            <FiLock className={styles.input_icon} />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Yeni şifreniz"
              required
            />
          </div>

          <button type="submit" className={styles.submit_button}>
            Şifreyi Güncelle
          </button>

          <div className={styles.toggle_text}>
            <span onClick={() => { setStep('request'); setError(''); setSuccessMessage(''); }} className={styles.toggle_link}>
              <FiArrowLeft style={{ verticalAlign: "middle" }} /> E-postayı Değiştir
            </span>
          </div>
        </form>
      )}
    </>
  );
};

export default ForgotPasswordForm;