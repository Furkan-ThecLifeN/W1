import React from "react";
import styles from "./TweetCard.module.css";
import { FiMoreHorizontal } from "react-icons/fi";
import ActionControls from "../actions/ActionControls";
import { defaultGetAuthToken } from "../actions/api";
import FollowButton from "../FollowButton/FollowButton";
import { useAuth } from "../../context/AuthProvider"; // AuthContext'ten geldiğini varsayıyoruz

// Token alma fonksiyonu aynı kalıyor
const getToken = async () => {
  try {
    return await defaultGetAuthToken();
  } catch (e) {
    console.error("TweetCard: Token alma hatası ->", e.message);
    return null;
  }
};

const TweetCard = ({ data }) => {
  // ⭐️ DÜZELTME: Bütün React Hook'ları (useAuth dahil) en üstte ve koşulsuz çağrılmalıdır.
  const { currentUser } = useAuth(); // Koşulsuz Çağrı

  // data'nın temel alanlarının kontrolünü burada yapabilirsiniz.
  if (!data || !data.id || !data.uid) {
    console.error("TweetCard: data veya data.id/uid eksik.");
    return null;
  }

  // Tweet'in sahibinin oturum açmış kullanıcı olup olmadığını kontrol et
  // Bu kontrol, hook çağrısı değildir, bu yüzden burada kalabilir.
  const isOwnFeeling = currentUser?.uid === data.uid;

  const renderActionControls = () => {
    // data.id'nin kontrolü yukarıda yapıldığı için burada tekrar if (!data.id) gerekmez
    return (
      <ActionControls
        targetType="feeling"
        targetId={data.id}
        getAuthToken={getToken}
        postOwnerUid={data.uid}
        commentsDisabled={data.commentsDisabled || false}
      />
    );
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.user}>
          <div className={styles.avatar_widget}>
            <img src={data.photoURL} alt="avatar" className={styles.avatar} />
          </div>
          <span className={styles.username}>{data.displayName}</span>
        </div>
        <div className={styles.actions}>
          {/* Sadece Kendi Tweet'imiz DEĞİLSE FollowButton'ı göster */}
          {!isOwnFeeling && (
            <FollowButton
              targetUid={data.uid}
              isTargetPrivate={data.isPrivate || false}
            />
          )}

          <FiMoreHorizontal className={styles.more} />
        </div>
      </div>

      <div className={`${styles.content} ${styles.feelings_text}`}>
        {data.text}
      </div>

      <div className={styles.footer}>{renderActionControls()}</div>
    </div>
  );
};

export default TweetCard;
