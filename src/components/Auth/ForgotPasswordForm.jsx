// src/components/Auth/ForgotPasswordForm.jsx

import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthProvider";
import styles from "./AuthForms.module.css"; // Yeni form stilleri
import { FiMail, FiArrowLeft } from "react-icons/fi";
import LoadingOverlay from "../LoadingOverlay/LoadingOverlay";

const ForgotPasswordForm = ({ onShowLogin }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { showToast } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Backend'deki forgot-password endpoint'ine istek at
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/forgot-password`,
        { email }
      );

      showToast(
        "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.",
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
      <form onSubmit={handleSubmit} className={styles.auth_form_container}>
        <h2>Şifreni Sıfırla</h2>
        <p className={styles.form_description}>
          Hesabınıza bağlı e-posta adresini girin, size şifrenizi sıfırlamanız
          için bir bağlantı göndereceğiz.
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
          Sıırlama Bağlantısı Gönder
        </button>

        <div className={styles.toggle_text}>
          <span onClick={onShowLogin} className={styles.toggle_link}>
            <FiArrowLeft style={{ verticalAlign: "middle" }} /> Giriş Ekranına Dön
          </span>
        </div>
      </form>
    </>
  );
};

export default ForgotPasswordForm;