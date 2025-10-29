import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import styles from "./ShareModal.module.css";
import {
  getFollowingRemote,
  sendShareRemote,
  getShareLinkRemote,
  defaultGetAuthToken,
} from "../actions/api";
import { FiX, FiLink, FiSend } from "react-icons/fi";
import { FaTwitter, FaWhatsapp, FaInstagram, FaTiktok } from "react-icons/fa";
// 1. ADIM: showToast'u import et
import { useAuth } from "../../context/AuthProvider"; 

export default function ShareModal({
  targetType,
  targetId,
  onClose,
  onSuccess,
  getAuthToken = defaultGetAuthToken,
}) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingTo, setSendingTo] = useState(null);
  const [isExiting, setIsExiting] = useState(false);
  
  // 2. ADIM: currentUser'a ek olarak showToast'u da al
  const { currentUser, showToast } = useAuth(); 

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(), 300);
  };

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!currentUser) {
        setLoading(false);
        setUsers([]);
        return;
      }

      setLoading(true);
      try {
        const token = await getAuthToken();
        const res = await getFollowingRemote({ token });
        if (!mounted) return;
        setUsers(res.users || []);
      } catch (e) {
        console.error("Takipçi yüklenemedi:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, [getAuthToken, currentUser]);

  async function handleSendTo(uid) {
    if (!targetId || !uid || !targetType || !currentUser) {
      console.error("Geçersiz targetId, targetType veya uid.");
      return;
    }
    try {
      setSendingTo(uid);
      await sendShareRemote({
        targetType,
        targetId,
        receiverUid: uid,
        getAuthToken,
      });
      console.log("Paylaşım başarılı.");
      handleClose();
      if (onSuccess) onSuccess();
      // 3. ADIM: Başarı toast'u (opsiyonel, eklendi)
      showToast("Gönderi başarıyla paylaşıldı!", "success"); 
    } catch (e) {
      console.error("Gönderilemedi:", e);
      // 4. ADIM: alert yerine showToast
      showToast(`Gönderme hatası: ${e.message}`, "error"); 
    } finally {
      setSendingTo(null);
    }
  }

  async function handleExternalShare() {
    try {
      if (!currentUser) return; 
      const token = await getAuthToken();
      await getShareLinkRemote({ targetType, targetId, token });
    } catch (e) {
      console.error("Harici paylaşım API çağrısı başarısız oldu:", e);
    }
  }

  async function handleCopyLink() {
    try {
      const link = `${window.location.origin}/${targetType}/${targetId}`;
      await navigator.clipboard.writeText(link);
      // 5. ADIM: alert yerine showToast
      showToast("Link kopyalandı!", "success"); 
      handleExternalShare(); 
    } catch (e) {
      console.error("Kopyalanamadı:", e);
      // 6. ADIM: alert yerine showToast
      showToast("Kopyalanamadı: " + e.message, "error"); 
    }
  }

  const socialButtons = [
    {
      name: "WhatsApp",
      icon: <FaWhatsapp />,
      action: () => {
        handleExternalShare();
        window.open(
          `https://wa.me/?text=${encodeURIComponent(
            `${window.location.origin}/${targetType}/${targetId}`
          )}`,
          "_blank"
        );
      },
    },
    {
      name: "Twitter",
      icon: <FaTwitter />,
      action: () => {
        handleExternalShare();
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            `${window.location.origin}/${targetType}/${targetId}`
          )}`,
          "_blank"
        );
      },
    },
    {
      name: "Instagram",
      icon: <FaInstagram />,
      action: () => {
        handleExternalShare();
        handleCopyLink(); // handleCopyLink zaten showToast("Link kopyalandı!") gösterecek
        // 7. ADIM: Bu gereksiz alert'i kaldırıyoruz.
        // alert("Link kopyalandı, Instagram'da manuel olarak paylaşabilirsiniz.");
      },
    },
    {
      name: "TikTok",
      icon: <FaTiktok />,
      action: () => {
        handleExternalShare();
        handleCopyLink(); // handleCopyLink zaten showToast("Link kopyalandı!") gösterecek
        // 8. ADIM: Bu gereksiz alert'i kaldırıyoruz.
        // alert("Link kopyalandı, TikTok'ta manuel olarak paylaşabilirsiniz.");
      },
    },
    { name: "Link Kopyala", icon: <FiLink />, action: handleCopyLink },
  ];

  return ReactDOM.createPortal(
    <div className={styles.overlay} onClick={handleClose}>
      <div
        className={`${styles.modal} ${
          isExiting ? styles.modalExit : styles.modalEnter
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <h3>Gönderiyi Paylaş</h3>
          <button onClick={handleClose} className={styles.closeBtn}>
            <FiX size={24} />
          </button>
        </header>

        <div className={styles.list}>
          {loading ? (
            <p className={styles.message}>Yükleniyor...</p>
          ) : currentUser ? (
            // Kullanıcı GİRİŞ YAPMIŞSA
            users.length === 0 ? (
              <p className={styles.message}>Takip ettiğiniz kimse yok.</p>
            ) : (
              users.map((u) => (
                <div key={u.uid} className={styles.card}>
                  <img
                    src={u.photoURL || "https://picsum.photos/40"}
                    alt={u.username}
                    className={styles.avatar}
                  />
                  <div className={styles.info}>
                    <div className={styles.displayName}>
                      {u.displayName || u.username}
                    </div>
                    <div className={styles.username}>@{u.username}</div>
                  </div>
                  <button
                    disabled={sendingTo === u.uid}
                    onClick={() => handleSendTo(u.uid)}
                    className={styles.sendBtn}
                  >
                    {sendingTo === u.uid ? "..." : <FiSend />}
                  </button>
                </div>
              ))
            )
          ) : (
            // Kullanıcı GİRİŞ YAPMAMIŞSA
            <p className={styles.message}>
              Arkadaşlarınıza göndermek için{" "}
              <a href="/login" className={styles.loginLink}>
                giriş yapın
              </a>
              .
            </p>
          )}
        </div>

        {/* Sosyal paylaşım butonları (her zaman görünür) */}
        <div className={styles.socialRow}>
          {socialButtons.map((btn, index) => (
            <button
              key={index}
              className={styles.socialBtn}
              onClick={btn.action}
            >
              {btn.icon}
              <span>{btn.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}