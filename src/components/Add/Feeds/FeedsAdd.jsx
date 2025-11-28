import React, { useState, useMemo } from "react";
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
  FiAlertCircle // Uyarı ikonu eklendi
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthProvider";
import { useUser } from "../../../context/UserContext";
import { motion } from "framer-motion";
import { auth } from "../../../config/firebase-client";

// ✅ ADSENSE İÇİN KRİTİK: Minimum içerik uzunluğu
// 150-200 karakter, içeriği "Low Value Content" olmaktan kurtarır.
const MIN_TEXT_LENGTH = 150;

const FeedsAdd = ({ onClose }) => {
  const [mediaUrl, setMediaUrl] = useState("");
  const [description, setDescription] = useState("");
  // Değişken adını mantığa uygun güncelledik: rulesAccepted
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [privacy, setPrivacy] = useState("public");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const { currentUser } = useUser();
  const { showToast } = useAuth();

  const videoId = useMemo(() => {
    const regex = /(?:youtube\.com\/shorts\/|youtu\.be\/)([\w-]{11})/;
    const match = mediaUrl.match(regex);
    return match ? match[1] : null;
  }, [mediaUrl]);

  // Kalan karakter sayısını hesapla
  const charsLeft = MIN_TEXT_LENGTH - description.length;
  const isDescriptionValid = description.length >= MIN_TEXT_LENGTH;

  const canShare =
    mediaUrl.trim() &&
    isDescriptionValid && // Uzunluk kontrolü
    rulesAccepted && // Yeni kural onayı
    !loading;

  const getPrivacyIcon = () => {
    switch (privacy) {
      case "public": return <FiGlobe size={16} />;
      case "friends": return <FiUsers size={16} />;
      case "close_friendships": return <FiEye size={16} />;
      case "private": return <FiLock size={16} />;
      default: return <FiGlobe size={16} />;
    }
  };

  const getPrivacyText = () => {
    switch (privacy) {
      case "public": return "Herkese Açık";
      case "friends": return "Sadece Arkadaşlar";
      case "close_friendships": return "Yakın Arkadaşlar";
      case "private": return "Sadece Ben";
      default: return "Herkese Açık";
    }
  };

  const handleShare = async () => {
    if (!mediaUrl.trim()) {
      setError("Lütfen bir YouTube Shorts linki ekleyin.");
      return;
    }
    
    // ✅ YENİ KONTROL: Açıklama uzunluğu
    if (!isDescriptionValid) {
      setError(`Açıklama çok kısa. En az ${MIN_TEXT_LENGTH} karakter yazmalısınız.`);
      showToast(`Lütfen en az ${MIN_TEXT_LENGTH} karakterlik bir açıklama yazın.`, "warning");
      return;
    }

    if (!videoId) {
      setError("Geçerli bir YouTube Shorts linki girin.");
      return;
    }
    
    if (!rulesAccepted) {
      setError("Lütfen paylaşım kurallarını kabul edin.");
      showToast("Kuralları onaylamanız gerekmektedir.", "error");
      return;
    }

    if (!auth.currentUser) {
      setError("Lütfen önce giriş yapın.");
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
            rulesAccepted: rulesAccepted, // Backend'e yeni parametre adı gidiyor
            privacy: privacy,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Hata oluştu");
      }

      setSuccess(true);
      setMediaUrl("");
      setDescription("");
      setRulesAccepted(false);
      setPrivacy("public");
      showToast("Feed başarıyla paylaşıldı!", "success");

      setTimeout(() => {
        if (typeof onClose === "function") onClose();
        else navigate("/home");
      }, 1500);
    } catch (err) {
      console.error("Feeds paylaşım hatası:", err);
      setError("Paylaşım yapılamadı. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.postCard}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
      >
        <div className={styles.postHeader}>
          <button className={styles.backButton} onClick={() => navigate(-1)}>
            <FiArrowLeft size={24} />
          </button>
          <h2 className={styles.title}>Yeni Feed Paylaş</h2>
          <button
            className={`${styles.shareButton} ${canShare ? styles.active : ""}`}
            onClick={handleShare}
            disabled={!canShare}
          >
            {loading ? "..." : <><FiSend size={18} /><span>Paylaş</span></>}
          </button>
        </div>

        <div className={styles.postContent}>
          {/* Medya Bölümü (Aynı kaldı) */}
          <div className={`${styles.mediaSection} ${videoId ? styles.mediaSectionVideo : ""}`}>
            {videoId ? (
              <div className={styles.videoPreviewContainer}>
                <iframe
                  className={styles.videoPreview}
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="YouTube preview"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
                <button className={styles.removeVideoButton} onClick={() => setMediaUrl("")}>
                  <FiX size={18} />
                </button>
              </div>
            ) : (
              <div className={styles.dropzone}>
                <FiYoutube size={48} className={styles.dropzoneIcon} />
                <p className={styles.dropzoneText}>YouTube Shorts linkini yapıştır</p>
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://youtube.com/shorts/..."
                    className={styles.inputField}
                  />
                </div>
              </div>
            )}
          </div>

          <div className={styles.detailsSection}>
            <div className={styles.userInfoAndPrivacy}>
               {/* Kullanıcı bilgileri aynı kaldı */}
               <div className={styles.avatar}>
                <img src={currentUser?.photoURL || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"} alt="avatar" className={styles.avatarImage} />
               </div>
               <div className={styles.userMeta}>
                 <span className={styles.username}>{currentUser?.displayName}</span>
                 {/* Gizlilik seçimi aynı kaldı... */}
                 <div className={styles.privacySelector}>
                    <div className={styles.privacyDisplay}>
                        {getPrivacyIcon()}
                        <span>{getPrivacyText()}</span>
                    </div>
                    <select className={styles.hiddenSelect} value={privacy} onChange={(e) => setPrivacy(e.target.value)}>
                        <option value="public">Herkese Açık</option>
                        <option value="friends">Sadece Arkadaşlar</option>
                        <option value="close_friendships">Yakın Arkadaşlar</option>
                        <option value="private">Sadece Ben</option>
                    </select>
                </div>
               </div>
            </div>

            {/* ✅ AÇIKLAMA ALANI GÜNCELLEMESİ */}
            <div className={styles.inputGroup}>
              <label htmlFor="description">
                Açıklama <small style={{color: '#888', fontWeight: 'normal'}}>(Zorunlu)</small>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Bu video hakkında düşüncelerini, neden paylaştığını veya yorumunu detaylıca yaz..."
                rows="6"
                className={styles.textareaField}
              />
              {/* Karakter Sayacı ve Uyarı */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '12px' }}>
                 <span style={{ color: charsLeft > 0 ? '#e74c3c' : '#2ecc71' }}>
                    {charsLeft > 0 
                      ? `${charsLeft} karakter daha yazmalısın (Kalite politikası)` 
                      : <span style={{display:'flex', alignItems:'center', gap:'4px'}}><FiCheck/> Uygun uzunlukta</span>}
                 </span>
                 <span>{description.length} krktr</span>
              </div>
            </div>

            {/* ✅ YENİ ONAY KUTUSU (Legal Uyumluluk İçin) */}
            <div className={styles.checkboxGroup} style={{alignItems: 'flex-start'}}>
              <input
                type="checkbox"
                id="rulesAccepted"
                checked={rulesAccepted}
                onChange={(e) => setRulesAccepted(e.target.checked)}
                className={styles.checkboxField}
                style={{marginTop: '4px'}}
              />
              <label htmlFor="rulesAccepted" style={{fontSize: '13px', lineHeight: '1.4', color: '#555'}}>
                Bu içeriği <strong>YouTube Hizmet Şartları</strong>'na ve 'Embed' kurallarına uygun olarak paylaştığımı; 
                videonun orijinal yayıncısının haklarına saygı duyduğumu ve 
                paylaşımımda <strong>topluluk kurallarına aykırı</strong> bir unsur bulunmadığını kabul ediyorum.
              </label>
            </div>

            {error && <p className={styles.errorMessage}><FiAlertCircle /> {error}</p>}
            {success && <p className={styles.successMessage}><FiCheck /> Başarılı!</p>}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FeedsAdd;