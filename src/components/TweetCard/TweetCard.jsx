import React from "react"; // useState kaldırıldı
import styles from "./TweetCard.module.css";
import { FiMoreHorizontal } from "react-icons/fi";
// Artık FaHeart/FaBookmark gibi ikonlara gerek yok, ActionControls kendi ikonlarını kullanır
import ActionControls from "../actions/ActionControls"; // Yeni import
import { defaultGetAuthToken } from "../actions/api"; // Token almak için gerekli

// PostCard'daki gibi token alma fonksiyonu
const getToken = async () => {
  try {
    return await defaultGetAuthToken();
  } catch (e) {
    console.error("TweetCard: Token alma hatası ->", e.message);
    return null;
  }
};

const TweetCard = ({ data }) => {
  // Manuel beğenme/kaydetme state'leri KALDIRILDI

  const renderActionControls = () => {
    if (!data?.id) return null;
    return (
      <ActionControls
        // KRİTİK: Target Type 'feeling' olarak ayarlandı
        targetType="feeling" 
        targetId={data.id}
        getAuthToken={getToken}
        postOwnerUid={data.uid} 
        // data objenizdeki bir alana göre yorumları devre dışı bırakabilirsiniz
        commentsDisabled={data.commentsDisabled || false} 
      />
    );
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.user}>
          <div className={styles.avatar_widget}>
            <img
              src={data?.photoURL}
              alt="avatar"
              className={styles.avatar}
            />
          </div>
          <span className={styles.username}>{data?.displayName}</span>
        </div>
        <div className={styles.actions}>
          <button className={styles.follow}>Follow</button>
          <FiMoreHorizontal className={styles.more} />
        </div>
      </div>

      <div className={styles.content}>{data?.text}</div>

      <div className={styles.footer}>
        {/* Tüm aksiyonlar için merkezi ActionControls bileşeni kullanıldı */}
        {renderActionControls()} 
      </div>
    </div>
  );
};

export default TweetCard;