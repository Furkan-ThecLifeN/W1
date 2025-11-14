import React, { useState, useMemo } from "react";
import styles from "./DemoFeedCreator.module.css";
import {
  FiGlobe,
  FiUsers,
  FiEye,
  FiLock,
  FiYoutube,
} from "react-icons/fi";
import { motion } from "framer-motion";

/**
 * FeedsAdd arayüzünün "canlı demo" versiyonu.
 * - Etkileşimlidir (yazı yazılabilir, seçim yapılabilir).
 * - Backend bağlantısı veya "Paylaş" butonu yoktur.
 * - Yapıştırılan YouTube Shorts linkini tanır ve video önizlemesi gösterir.
 */
const DemoFeedCreator = () => {
  // Demo bileşeninin kendi state'i
  const [mediaUrl, setMediaUrl] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [ownershipAccepted, setOwnershipAccepted] = useState(false);

  // mediaUrl değiştiğinde video ID'sini çıkarmak için useMemo kullanılır.
  const videoId = useMemo(() => {
    // YouTube Shorts ve standart youtu.be linklerini yakalayan Regex
    const regex =
      /(?:youtube\.com\/shorts\/|youtu\.be\/)([\w-]{11})/;
    const match = mediaUrl.match(regex);
    return match ? match[1] : null;
  }, [mediaUrl]);

  // Gizlilik metni ve ikonu için yardımcı fonksiyonlar (İngilizce UI metni)
  const getPrivacyIcon = () => {
    switch (privacy) {
      case "public":
        return <FiGlobe size={16} />;
      case "friends":
        return <FiUsers size={16} />;
      case "close_friendships":
        return <FiEye size={16} />;
      case "private":
        return <FiLock size={16} />;
      default:
        return <FiGlobe size={16} />;
    }
  };

  const getPrivacyText = () => {
    switch (privacy) {
      case "public":
        return "Public";
      case "friends":
        return "Friends Only";
      case "close_friendships":
        return "Close Friends";
      case "private":
        return "Only Me";
      default:
        return "Public";
    }
  };

  return (
    // 'FeedsAdd'deki .postCard'dan ilham alan ana konteyner
    <motion.div
      className={styles.postCard}
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", damping: 20, stiffness: 100 }}
    >
      {/* Başlık alanı (Paylaş/Geri butonları olmadan, sadece başlık) */}
      <div className={styles.postHeader}>
        <h2 className={styles.title}>Create Stunning Feeds</h2>
      </div>

      {/* 'FeedsAdd'deki gibi çift sütunlu içerik alanı */}
      <div className={styles.postContent}>
        {/* 1. Sütun: Medya (YouTube Linki veya Önizleme) */}
        <div
          className={`${styles.mediaSection} ${
            videoId ? styles.mediaSectionVideo : ""
          }`}
        >
          {videoId ? (
            // Geçerli bir video ID'si varsa önizlemeyi göster
            <div className={styles.videoPreviewContainer}>
              <iframe
                className={styles.videoPreview}
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            // Video ID'si yoksa 'dropzone'u göster
            <div className={styles.dropzone}>
              <FiYoutube size={48} className={styles.dropzoneIcon} />
              <p className={styles.dropzoneText}>
                Paste your YouTube Shorts link here
              </p>
              <div className={styles.inputGroup}>
                <label htmlFor="demoMediaUrl">YouTube Shorts Link</label>
                <input
                  type="text"
                  id="demoMediaUrl"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://youtube.com/shorts/..."
                  className={styles.inputField}
                />
              </div>
            </div>
          )}
        </div>

        {/* 2. Sütun: Detaylar (Açıklama, Gizlilik, vb.) */}
        <div className={styles.detailsSection}>
          {/* Kullanıcı Bilgisi (Demo için sabit) */}
          <div className={styles.userInfoAndPrivacy}>
            <div className={styles.avatar}>
              <img
                src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                alt="Demo User Avatar"
                className={styles.avatarImage}
              />
            </div>
            <div className={styles.userMeta}>
              <span className={styles.username}>Demo User</span>
              <div className={styles.privacySelector}>
                <div className={styles.privacyDisplay}>
                  {getPrivacyIcon()}
                  <span>{getPrivacyText()}</span>
                </div>
                <select
                  className={styles.hiddenSelect}
                  value={privacy}
                  onChange={(e) => setPrivacy(e.target.value)}
                >
                  <option value="public">Public</option>
                  <option value="friends">Friends Only</option>
                  <option value="close_friendships">Close Friends</option>
                  <option value="private">Only Me</option>
                </select>
              </div>
            </div>
          </div>

          {/* Açıklama */}
          <div className={styles.inputGroup}>
            <label htmlFor="demoDescription">Description</label>
            <textarea
              id="demoDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write something about your video..."
              rows="6"
              className={styles.textareaField}
            />
          </div>

          {/* Sahiplik Onayı */}
          <div className={styles.checkboxGroup}>
            <input
              type="checkbox"
              id="demoOwnership"
              checked={ownershipAccepted}
              onChange={(e) => setOwnershipAccepted(e.target.checked)}
              className={styles.checkboxField}
            />
            <label htmlFor="demoOwnership">
              I confirm I own the rights to this content.
            </label>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DemoFeedCreator;