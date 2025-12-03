// src/components/Auth/RegisterForm.jsx

import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthProvider";
import styles from "./AuthForms.module.css"; // Yeni form stilleri
import LoadingOverlay from "../LoadingOverlay/LoadingOverlay";
import { FiMail, FiUser, FiLock, FiType } from "react-icons/fi"; // İkonlar eklendi

// Client-side validasyon regex'leri (Aynı)
const isValidEmailFormat = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidUsernameFormat = (username) => /^[a-z0-9_.]{3,24}$/.test(username);
const isValidPasswordFormat = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]).{8,}$/.test(
    password
  );

// onRegisterSuccess ve onShowLogin prop'ları eklendi
const RegisterForm = ({ onRegisterSuccess, onShowLogin }) => {
  const { showToast } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    displayName: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    general: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "", general: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const { email, username, displayName, password, confirmPassword } = formData;
    let valid = true;
    const newErrors = { email: "", username: "", password: "", confirmPassword: "", general: "" };

    if (!isValidEmailFormat(email)) {
      newErrors.email = "Geçerli bir e-posta adresi gerekli.";
      valid = false;
    }
    if (!isValidUsernameFormat(username)) {
      newErrors.username = "Kullanıcı adı 3-24 karakter, küçük harf, rakam, alt çizgi (_) veya nokta (.) içermelidir.";
  valid = false;
    }
    if (!isValidPasswordFormat(password)) {
      newErrors.password =
        "Şifre en az 8 karakter, 1 büyük harf, 1 küçük harf, 1 rakam ve 1 özel karakter içermelidir.";
      valid = false;
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Şifreler eşleşmiyor.";
      valid = false;
    }

    if (!valid) {
      setErrors(newErrors);
      return;
    }
    
    // ... (Mevcut handleSubmit fonksiyonunuzun geri kalanı) ...
    // ... (API isteği mantığı aynı kalacak) ...
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/register`,
        { email, username, displayName, password, confirmPassword }
      );

      console.log("Kayıt başarılı:", response.data);
      showToast("Kayıt başarılı! Şimdi giriş yapabilirsiniz.", "success");
      setFormData({ email: "", username: "", displayName: "", password: "", confirmPassword: "" });
      setErrors({ email: "", username: "", password: "", confirmPassword: "", general: "" });

      if (onRegisterSuccess) onRegisterSuccess(); // Giriş formuna geçişi tetikle
    
    } catch (error) {
      console.error("Kayıt hatası:", error);
      if (error.response?.data?.error) {
        if (error.response.data.error.includes("already in use")) {
          setErrors((prev) => ({ ...prev, general: "Bu e-posta adresi veya kullanıcı adı zaten kullanılıyor." }));
        } else {
          setErrors((prev) => ({ ...prev, general: error.response.data.error }));
        }
      } else {
        setErrors((prev) => ({ ...prev, general: "Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin." }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <LoadingOverlay />}
      <form onSubmit={handleSubmit} className={styles.auth_form_container}>
        <h2>Hesap Oluştur</h2>
        <p className={styles.form_description}>
          Topluluğumuza katılmak için bilgilerinizi girin.
        </p>
        
        {errors.general && (
          <span className={styles.error_text_general}>{errors.general}</span>
        )}

        <div className={styles.input_group}>
          <FiMail className={styles.input_icon} />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="E-posta adresi"
            required
          />
        </div>
        {errors.email && (
          <span className={styles.error_text_field}>{errors.email}</span>
        )}

        <div className={styles.input_group}>
          <FiUser className={styles.input_icon} />
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Kullanıcı Adı"
            required
          />
        </div>
        {errors.username && (
          <span className={styles.error_text_field}>{errors.username}</span>
        )}

        <div className={styles.input_group}>
          <FiType className={styles.input_icon} />
          <input
            type="text"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            placeholder="Görünen İsim (Opsiyonel)"
          />
        </div>

        <div className={styles.input_group}>
          <FiLock className={styles.input_icon} />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Şifre"
            required
          />
        </div>
        {errors.password && (
          <span className={styles.error_text_field}>{errors.password}</span>
        )}

        <div className={styles.input_group}>
          <FiLock className={styles.input_icon} />
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Şifreyi Onayla"
            required
          />
        </div>
        {errors.confirmPassword && (
          <span className={styles.error_text_field}>
            {errors.confirmPassword}
          </span>
        )}

        <button type="submit" className={styles.submit_button}>
          Kayıt Ol
        </button>

        <p className={styles.toggle_text}>
          Zaten hesabın var mı?{" "}
          <span onClick={onShowLogin} className={styles.toggle_link}>
            Giriş Yap
          </span>
        </p>
      </form>
    </>
  );
};

export default RegisterForm;