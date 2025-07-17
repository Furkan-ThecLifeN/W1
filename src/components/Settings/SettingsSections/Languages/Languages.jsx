import React, { useState } from "react";
import { FaGlobeAmericas, FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import styles from "./Languages.module.css";
import Spinner from "../../../Spinner/Spinner";  

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "tr", label: "Türkçe" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "ru", label: "Русский" },
  { code: "zh", label: "中文" },
  { code: "ja", label: "日本語" },
  { code: "ar", label: "العربية" },
  { code: "hi", label: "हिन्दी" },
  { code: "pt", label: "Português" },
  { code: "it", label: "Italiano" },
];

const Languages = () => {
  const [selected, setSelected] = useState("en");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSelect = (code) => {
    setSelected(code);
  };

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/home");
    }, 2500);
  };

  return (
    <>
      {loading && <Spinner />} {/* Spinner componenti burada kullanıldı */}

      <div className={styles.container} aria-busy={loading}>
        <header className={styles.header}>
          <FaGlobeAmericas className={styles.icon} />
          <h1>Dil Seçimi</h1>
        </header>

        <div className={styles.grid}>
          {LANGUAGES.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => handleSelect(code)}
              className={`${styles.langButton} ${
                selected === code ? styles.active : ""
              }`}
              aria-pressed={selected === code}
              aria-label={`Dil seç: ${label}`}
              disabled={loading}
            >
              <span>{label}</span>
              {selected === code && (
                <FaCheckCircle className={styles.checkIcon} />
              )}
            </button>
          ))}
        </div>

        <button
          onClick={handleSave}
          className={styles.saveButton}
          disabled={loading}
          aria-label="Dil seçimlerini kaydet"
        >
          Kaydet
        </button>
      </div>
    </>
  );
};

export default Languages;
