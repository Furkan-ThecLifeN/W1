// QuoteCard.jsx
import React, { useState } from "react";
import styles from "./QuoteCard.module.css";
import DescriptionModal from "../DescriptionModal/DescriptionModal"; // Modal için gerekli
import { useNavigate } from "react-router-dom";

// Metin kısaltma limiti
const TRUNCATE_LIMIT = 1000;

const QuoteCard = ({ data }) => {
  const navigate = useNavigate();
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);

  // Eğer `data` veya gerekli alanlar yoksa bileşeni render etme
  if (!data || !data.id || !data.uid) {
    return null;
  }

  const quoteText = data.text || "";
  const needsTruncation = quoteText.length > TRUNCATE_LIMIT;

  // Metni kısalt veya orijinal halini göster
  const truncatedText = needsTruncation
    ? quoteText.substring(0, TRUNCATE_LIMIT).trim() + "... Daha Fazla"
    : quoteText;

  return (
    <>
      <div className={styles.card}>
        {/* Üst Kısım: Avatar ve Kullanıcı Bilgileri */}
        <div className={styles.header}>
          <div className={styles.user}>
            <div className={styles.avatar_widget}>
              <img
                src={data.photoURL || "https://picsum.photos/50/50"}
                alt="avatar"
                className={styles.avatar}
              />
            </div>
            <div className={styles.user_info}>
              <span className={styles.displayName}>{data.displayName}</span>
            </div>
          </div>
        </div>

        {/* İçerik: Alıntı Metni */}
        <div
          className={`${styles.content} ${
            needsTruncation ? styles.clickableText : ""
          }`}
          // Eğer metin uzunsa, tıklandığında modal aç
          onClick={
            needsTruncation ? () => setIsDescriptionModalOpen(true) : undefined
          }
        >
          {truncatedText}
        </div>

        {/* Resim ve Footer (ActionControls) kısımları kaldırıldı */}
      </div>

      {/* Uzun metinler için açılacak olan modal */}
      {isDescriptionModalOpen && (
        <DescriptionModal
          data={{ ...data, caption: quoteText }}
          onClose={() => setIsDescriptionModalOpen(false)}
          // Follow ile ilgili proplar kaldırıldı
        />
      )}
    </>
  );
};

export default QuoteCard;