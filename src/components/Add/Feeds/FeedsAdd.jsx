import React, { useState, useMemo } from "react"; // useMemo eklendi
import styles from "./FeedsAdd.module.css";
import {
  FiArrowLeft,
  FiSend,
  FiCheck,
  FiX,
  FiGlobe,
  FiUsers,
  FiEye,
  FiLock,
  FiYoutube,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthProvider";
import { useUser } from "../../../context/UserContext";
import { motion } from "framer-motion";
import { auth } from "../../../config/firebase-client";

const FeedsAdd = ({ onClose }) => {
  const [mediaUrl, setMediaUrl] = useState("");
  const [description, setDescription] = useState("");
  const [ownershipAccepted, setOwnershipAccepted] = useState(false);
  const [privacy, setPrivacy] = useState("public");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const { currentUser } = useUser();
  const { showToast } = useAuth();

  // YENİ: mediaUrl değiştiğinde video ID'sini çıkarmak için useMemo kullanılır.
  const videoId = useMemo(() => {
    // YouTube Shorts ve standart youtu.be linklerini yakalayan Regex
    const regex =
      /(?:youtube\.com\/shorts\/|youtu\.be\/)([\w-]{11})/;
    const match = mediaUrl.match(regex);
    return match ? match[1] : null; // Eşleşme varsa video ID'sini, yoksa null döndür
  }, [mediaUrl]); // Sadece mediaUrl değiştiğinde çalışır

  // Aktif 'Paylaş' butonu için kontrol
  const canShare =
    mediaUrl.trim() &&
    description.trim() &&
    ownershipAccepted &&
    !loading;

  // Gizlilik ikonu ve metni için yardımcı fonksiyonlar (değişiklik yok)
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
        return "Herkese Açık";
      case "friends":
        return "Sadece Arkadaşlar";
      case "close_friendships":
        return "Yakın Arkadaşlar";
      case "private":
        return "Sadece Ben";
      default:
        return "Herkese Açık";
    }
  };

  // handleShare ve handleClose fonksiyonları (değişiklik yok)
  const handleShare = async () => {
    if (!mediaUrl.trim() || !description.trim()) {
      setError("Lütfen tüm alanları doldurun.");
      showToast("Tüm alanlar zorunludur.", "error");
      return;
    }
    // YENİ: videoId kontrolü (regex'in bir ID bulup bulmadığına bakar)
    if (!videoId) {
      setError("Geçerli bir YouTube Shorts linki girin.");
      showToast("Geçersiz YouTube Shorts linki.", "error");
      return;
    }
    if (!ownershipAccepted) {
      setError("Lütfen sahiplik beyanını onaylayın.");
      showToast("Paylaşım için sahiplik onayı zorunludur.", "error");
      return;
    }
    if (!auth.currentUser) {
      setError("Lütfen önce giriş yapın.");
      showToast("İşlem için giriş yapmalısınız.", "error");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const idToken = await auth.currentUser.getIdToken();
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/feeds/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            postText: description,
            mediaUrl: mediaUrl,
            ownershipAccepted: ownershipAccepted,
            privacy: privacy,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Feeds paylaşılırken bir hata oluştu.";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(data.message);
      setSuccess(true);
      setMediaUrl("");
      setDescription("");
      setOwnershipAccepted(false);
      setPrivacy("public");
      showToast("Feeds başarıyla paylaşıldı!", "success");

      setTimeout(() => {
        if (typeof onClose === "function") onClose();
        else navigate("/home");
      }, 1500);
    } catch (err) {
      console.error("Feeds paylaşım hatası:", err);
      setError(err.message || "Feeds paylaşılırken bir hata oluştu.");
      showToast("Paylaşım başarısız!", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (typeof onClose === "function") onClose();
    else navigate("/home");
  };

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.postCard}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
      >
        <div className={styles.postHeader}>
          <button className={styles.backButton} onClick={() => navigate(-1)}>
            <FiArrowLeft size={24} />
          </button>
          <h2 className={styles.title}>Yeni Feeds Paylaş</h2>
          <button
            className={`${styles.shareButton} ${canShare ? styles.active : ""}`}
            onClick={handleShare}
            disabled={!canShare}
          >
            {loading ? (
              "..."
            ) : (
              <>
                <FiSend size={18} />
                <span>Paylaş</span>
              </>
            )}
          </button>
        </div>

        <div className={styles.postContent}>
          {/* 1. Sütun: Medya (YouTube Linki VEYA ÖNİZLEME) */}
          {/* YENİ: videoId varsa .mediaSectionVideo sınıfı eklenir */}
          <div
            className={`${styles.mediaSection} ${
              videoId ? styles.mediaSectionVideo : ""
            }`}
          >
            {videoId ? (
              // 1. Durum: videoId bulundu -> Önizlemeyi göster
              <div className={styles.videoPreviewContainer}>
                <iframe
                  className={styles.videoPreview}
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
                {/* YENİ: Videoyu kaldırmak için 'X' butonu */}
                <button
                  className={styles.removeVideoButton}
                  onClick={() => setMediaUrl("")}
                >
                  <FiX size={18} />
                </button>
              </div>
            ) : (
              // 2. Durum: videoId yok -> 'dropzone'u göster
              <div className={styles.dropzone}>
                <FiYoutube size={48} className={styles.dropzoneIcon} />
                <p className={styles.dropzoneText}>
                  YouTube Shorts linkinizi buraya yapıştırın
                </p>
                <div className={styles.inputGroup}>
                  <label htmlFor="mediaUrl">YouTube Shorts Linki</label>
                  <input
                    type="text"
                    id="mediaUrl"
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
            {/* ... (2. sütundaki kodların tamamı değişmedi) ... */}
            <div className={styles.userInfoAndPrivacy}>
              <div className={styles.avatar}>
                <img
                  src={
                    currentUser?.photoURL ||
                    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                  }
                  alt="User Avatar"
                  className={styles.avatarImage}
                />
              </div>
              <div className={styles.userMeta}>
                <span className={styles.username}>
                  {currentUser?.displayName || "Kullanıcı Adı"}
                </span>
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
                    <option value="public">Herkese Açık</option>
                    <option value="friends">Sadece Arkadaşlar</option>
                    <option value="close_friendships">Yakın Arkadaşlar</option>
                    <option value="private">Sadece Ben</option>
                  </select>
                </div>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="description">Açıklama</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Video hakkında bir şeyler yazın..."
                rows="6"
                className={styles.textareaField}
              />
            </div>

            <div className={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="ownershipAccepted"
                checked={ownershipAccepted}
                onChange={(e) => setOwnershipAccepted(e.target.checked)}
                className={styles.checkboxField}
              />
              <label htmlFor="ownershipAccepted">
                Bu içeriğin sahibi olduğumu beyan ederim.
              </label>
            </div>

            {error && (
              <p className={styles.errorMessage}>
                <FiX /> {error}
              </p>
            )}
            {success && (
              <p className={styles.successMessage}>
                <FiCheck /> Başarıyla paylaşıldı!
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FeedsAdd;