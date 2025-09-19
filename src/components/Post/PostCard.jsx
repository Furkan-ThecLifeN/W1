import React, { useState, useEffect } from "react";
import styles from "./PostCard.module.css";
import { FiMoreHorizontal } from "react-icons/fi";
import ActionControls from "../actions/ActionControls";

// api.js dosyasından çekilecek fonksiyonları ekledik
import { defaultGetAuthToken } from "../actions/api"; // 👈 getPostStats artık burada kullanılmayacak

const PostCard = ({ data }) => {
  const [tokenError, setTokenError] = useState(false);

  // Artık stateleri burada tutmaya gerek yok, ActionControls kendi içinde yönetecek.
  // Bu state'ler kaldırılabilir veya başlangıç değerleri olarak kullanılabilir.
  //const [liked, setLiked] = useState(data?.userLiked ?? false);
  //const [saved, setSaved] = useState(data?.userSaved ?? false);
  //const [stats, setStats] = useState(data?.initialStats ?? { likes: 0, comments: 0, shares: 0 });

  // Token alma fonksiyonu
  const getToken = async () => {
    try {
      return await defaultGetAuthToken();
    } catch (e) {
      console.error("PostCard: Token alma hatası ->", e.message);
      setTokenError(true);
      return null;
    }
  };

  // 👈 Yeni useEffect hook'u kaldırıldı
  // PostCard bileşeninin ilk yüklemede veriyi çekme mantığı artık ActionControls'e taşındı.
  // useEffect(() => { ... }, [data?.id]);

  // ActionControls wrapper
  const renderActionControls = () => {
    if (!data?.id) {
      console.warn("PostCard: id yok, ActionControls render edilmedi!");
      return null;
    }
    return (
      // 👈 ActionControls'e stat'ler prop olarak gönderilmeyecek
      <ActionControls
        targetType="post"
        targetId={data.id}
        getAuthToken={getToken}
      />
    );
  };

  // Kısa console log kontrolleri
  useEffect(() => {
    if (!data) return console.warn("PostCard: data yok!");
    if (!data.id) console.warn("PostCard: post id eksik!");
    if (!data.caption) console.warn("PostCard: caption eksik!");
    if (!data.imageUrls?.[0]) console.warn("PostCard: image yok!");
    console.log("PostCard Firestore id =>", data?.id);
  }, [data]);

  return (
    <>
      {/* Desktop */}
      <div className={`${styles.post_card} ${styles.desktop}`}>
        {data?.imageUrls?.[0] ? (
          <img
            src={data.imageUrls[0]}
            alt="Post"
            className={styles.post_image}
          />
        ) : null}

        <div className={styles.post_overlay}>
          <div className={styles.post_header}>
            <div className={styles.user_info}>
              <div className={styles.avatar_widget}>
                <img
                  src={data?.photoURL || ""}
                  alt="avatar"
                  className={styles.avatar}
                />
              </div>
              <span className={styles.username}>
                {data?.displayName || "Bilinmeyen Kullanıcı"}
              </span>
            </div>
            <div className={styles.actions}>
              <button className={styles.follow_btn}>Follow</button>
              <FiMoreHorizontal className={styles.more_icon} />
            </div>
          </div>

          <div className={styles.post_footer}>
            <p className={styles.post_text}>{data?.caption || ""}</p>
            {renderActionControls()}

            {tokenError && (
              <div style={{ color: "red", fontSize: "12px" }}>
                Token alınamadı, ActionControls çalışmayabilir!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className={`${styles.post_card_mobile} ${styles.mobile}`}>
        <div className={styles.post_header_mobile}>
          <div className={styles.user_info}>
            <div className={styles.avatar_widget}>
              <img
                src={data?.photoURL || ""}
                alt="avatar"
                className={styles.avatar}
              />
            </div>
            <span className={styles.username}>
              {data?.displayName || "Bilinmeyen Kullanıcı"}
            </span>
          </div>
          <div className={styles.actions}>
            <button className={styles.follow_btn}>Follow</button>
            <FiMoreHorizontal className={styles.more_icon} />
          </div>
        </div>

        {data?.imageUrls?.[0] ? (
          <img
            src={data.imageUrls[0]}
            alt="Post"
            className={styles.post_image_mobile}
          />
        ) : null}

        <div className={styles.post_footer_mobile}>
          <p className={styles.post_text}>{data?.caption || ""}</p>
          {renderActionControls()}
        </div>
      </div>
    </>
  );
};

export default PostCard;