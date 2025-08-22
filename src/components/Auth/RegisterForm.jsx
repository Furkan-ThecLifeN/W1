import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthProvider";
import styles from "./AuthForms.module.css";
import LoadingOverlay from "../LoadingOverlay/LoadingOverlay";

// Client-side validasyon regex'leri
const isValidEmailFormat = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidUsernameFormat = (username) => /^[a-z0-9_.]{3,15}$/.test(username);
const isValidPasswordFormat = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]).{8,}$/.test(password);

const RegisterForm = ({ onRegisterSuccess }) => {
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

    // Validation
    let valid = true;
    const newErrors = { email: "", username: "", password: "", confirmPassword: "", general: "" };

    if (!isValidEmailFormat(email)) {
      newErrors.email = "Geçerli bir e-posta adresi gerekli.";
      valid = false;
    }
    if (!isValidUsernameFormat(username)) {
      newErrors.username = "Kullanıcı adı 3-15 karakter, küçük harf, rakam, alt çizgi (_) veya nokta (.) içermelidir.";
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

      if (onRegisterSuccess) onRegisterSuccess();
    } catch (error) {
      console.error("Kayıt hatası:", error);
      if (error.response?.data?.error) {
        if (error.response.data.error.includes("already in use")) {
          setErrors((prev) => ({ ...prev, general: "Bu e-posta adresi zaten kullanılıyor. Lütfen başka bir e-posta adresi deneyin." }));
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
        <h2>Kayıt Ol</h2>

        {errors.general && <span className={styles.error_text}>{errors.general}</span>}

        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="email@example.com"
          required
        />
        {errors.email && <span className={styles.error_text}>{errors.email}</span>}

        <label>Kullanıcı Adı</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="benzersiz_kullanici"
          required
        />
        {errors.username && <span className={styles.error_text}>{errors.username}</span>}

        <label>Görünen İsim (Opsiyonel)</label>
        <input
          type="text"
          name="displayName"
          value={formData.displayName}
          onChange={handleChange}
          placeholder="Furkan Yılmaz"
        />

        <label>Şifre</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="********"
          required
        />
        {errors.password && <span className={styles.error_text}>{errors.password}</span>}

        <label>Şifreyi Onayla</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="********"
          required
        />
        {errors.confirmPassword && <span className={styles.error_text}>{errors.confirmPassword}</span>}

        <button type="submit">Kayıt Ol</button>
      </form>
    </>
  );
};

export default RegisterForm;
