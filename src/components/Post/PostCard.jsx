// PostCard.jsx
import React, { useState, useEffect } from "react";
import styles from "./PostCard.module.css";
import { FiMoreHorizontal } from "react-icons/fi";
import ActionControls from "../actions/ActionControls";

// api.js dosyasından çekilecek fonksiyonları ekledik
import { defaultGetAuthToken, getPostStats } from "../actions/api";

const PostCard = ({ data }) => {
  const [tokenError, setTokenError] = useState(false);
  
  // Yeni state'ler tanımlandı
  const [liked, setLiked] = useState(data?.userLiked ?? false);
  const [saved, setSaved] = useState(data?.userSaved ?? false);
  const [stats, setStats] = useState(data?.initialStats ?? { likes: 0, comments: 0, shares: 0 });

  // Token alma fonksiyonu
  const getToken = async () => {
    try {
      // Artık import edildiği için dinamik import'a gerek yok
      return await defaultGetAuthToken();
    } catch (e) {
      console.error("PostCard: Token alma hatası ->", e.message);
      setTokenError(true);
      return null;
    }
  };

  // Yeni useEffect hook'u: Component yüklendiğinde veya data.id değiştiğinde çalışır
  useEffect(() => {
    // API'den güncel verileri çekecek asenkron fonksiyon
    async function fetchPostStatus() {
      if (!data?.id) {
        console.warn("PostCard: Post ID eksik, istatistikler çekilemiyor.");
        return;
      }
      try {
        const token = await getToken();
        if (!token) {
          console.error("PostCard: Token bulunamadı, istatistikler çekilemiyor.");
          return;
        }
        
        // API'den stats, liked ve saved durumlarını çekme
        const res = await getPostStats({ targetType: 'post', targetId: data.id, token });
        
        // State'leri API yanıtıyla güncelleme
        setStats(res.stats);
        setLiked(res.liked);
        setSaved(res.saved);
      } catch (e) {
        console.error("PostCard: İstatistik çekme hatası ->", e.message);
      }
    }

    fetchPostStatus();
    
    // eslint-disable-next-line
  }, [data?.id]); // data.id değiştiğinde tekrar çalışır

  // ActionControls wrapper
  const renderActionControls = () => {
    if (!data?.id) {
      console.warn("PostCard: id yok, ActionControls render edilmedi!");
      return null;
    }
    return (
      <ActionControls
        targetType="post"
        targetId={data.id}
        // State'ten gelen dinamik değerler props olarak gönderiliyor
        initialLiked={liked}
        initialSaved={saved}
        initialStats={stats}
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