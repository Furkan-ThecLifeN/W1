// src/components/Settings/SettingsSections/AccountTypeSettings/AccountTypeSettings.jsx

import React, { useState, useEffect } from "react";
import styles from "./AccountTypeSettings.module.css";
import {
  FiUser,
  FiBriefcase,
  FiCheckCircle,
  FiInfo,
  FiAlertCircle,
} from "react-icons/fi";
import { useUser } from "../../../../context/UserContext";
import LoadingOverlay from "../../../LoadingOverlay/LoadingOverlay";
import { auth } from "../../../../config/firebase-client";
import { useAuth } from "../../../../context/AuthProvider"; // ✅ YENİ: useAuth hook'unu import edin

const AccountTypeSettings = () => {
  const { currentUser, setCurrentUser } = useUser();
  const { showToast } = useAuth(); // ✅ YENİ: showToast fonksiyonunu alın
  const [selectedType, setSelectedType] = useState(
    currentUser?.accountType || "personal"
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setSelectedType(currentUser.accountType);
    }
  }, [currentUser]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const idToken = await auth.currentUser.getIdToken();
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/users/profile/update`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ accountType: selectedType }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setCurrentUser((prevUser) => ({
          ...prevUser,
          accountType: selectedType,
        }));
        showToast("Hesap türü başarıyla güncellendi.", "success"); // ✅ showToast ile başarılı mesaj gönder
      } else {
        showToast(
          data.error || "Hesap türü güncellenirken bir hata oluştu.",
          "error"
        ); // ✅ showToast ile hata mesajı gönder
      }
    } catch (err) {
      showToast("Bağlantı hatası. Lütfen daha sonra tekrar deneyin.", "error"); // ✅ showToast ile bağlantı hatası gönder
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      {loading && <LoadingOverlay />}
      <h2 className={styles.heading}>Hesap Türünüzü Seçin</h2>
      <p className={styles.subtext}>
        <FiBriefcase /> Hesabınızı en iyi tanımlayan türü seçin. İçerik
        üreticisi paneline erişmek için hesabınızı işletmeye
        dönüştürebilirsiniz.
      </p>

      <div className={styles.options}>
        <div
          className={`${styles.card} ${
            selectedType === "personal" ? styles.active : ""
          }`}
          onClick={() => setSelectedType("personal")}
        >
          <FiUser className={styles.icon} />
          <h3>Bireysel Hesap</h3>
          <p>
            Kişisel kullanımlar, portföyler veya ticari olmayan amaçlar için
            idealdir.
          </p>
        </div>

        <div
          className={`${styles.card} ${
            selectedType === "business" ? styles.active : ""
          }`}
          onClick={() => setSelectedType("business")}
        >
          <FiBriefcase className={styles.icon} />
          <h3>İşletme Hesabı</h3>
          <p>
            Şirketler, markalar veya hizmet sunan freelance çalışanlar için
            önerilir.
          </p>
        </div>
      </div>

      <div className={styles.footer}>
        <button
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={selectedType === currentUser?.accountType || loading}
        >
          Değişiklikleri Kaydet
        </button>
      </div>
    </div>
  );
};

export default AccountTypeSettings;
