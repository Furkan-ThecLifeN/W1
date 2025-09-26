import React, { useState } from "react";
import styles from "./FeedsAdd.module.css";
import { FiArrowLeft, FiSend, FiCheck, FiX, FiGlobe, FiUsers, FiEye, FiLock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthProvider";
import { useUser } from "../../../context/UserContext";
import { motion } from "framer-motion";
import { auth } from "../../../config/firebase-client";

const FeedsAdd = ({ onClose }) => {
  const [mediaUrl, setMediaUrl] = useState("");
  const [description, setDescription] = useState("");
  const [ownershipAccepted, setOwnershipAccepted] = useState(false);
  const [privacy, setPrivacy] = useState("public"); // ✅ yeni state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const { currentUser } = useUser();
  const { showToast } = useAuth();

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

  const handleShare = async () => {
    if (!mediaUrl.trim() || !description.trim()) {
      setError("Lütfen tüm alanları doldurun.");
      showToast("Tüm alanlar zorunludur.", "error");
      return;
    }

    if (
      !mediaUrl.includes("youtube.com/shorts/") &&
      !mediaUrl.includes("youtu.be/")
    ) {
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
            privacy: privacy, // ✅ backend'e gönderildi
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
    <div className={styles.modalOverlay}>
      <motion.div
        className={styles.modalContainer}
        initial={{ y: "100vh" }}
        animate={{ y: 0 }}
        exit={{ y: "100vh" }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
      >
        <div className={styles.modalHeader}>
          <button className={styles.backButton} onClick={handleClose}>
            <FiArrowLeft size={24} />
          </button>
          <h2 className={styles.modalTitle}>Yeni Feeds Paylaş</h2>
        </div>
        <div className={styles.formContent}>
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
          <div className={styles.inputGroup}>
            <label htmlFor="description">Açıklama</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Video hakkında bir şeyler yazın..."
              rows="4"
              className={styles.textareaField}
            />
          </div>

          {/* ✅ Yeni Gizlilik Ayarı */}
          <div className={styles.inputGroup}>
            <label>Gizlilik Ayarı</label>
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
        <div className={styles.modalFooter}>
          <motion.button
            className={styles.shareButton}
            onClick={handleShare}
            disabled={loading}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? (
              "Paylaşılıyor..."
            ) : (
              <>
                <FiSend size={18} /> Paylaş
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default FeedsAdd;
