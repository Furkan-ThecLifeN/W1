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

export default function ShareModal({
  postId,
  onClose,
  onSuccess,
  getAuthToken = defaultGetAuthToken,
}) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingTo, setSendingTo] = useState(null);
  const [isExiting, setIsExiting] = useState(false);

  // Modal kapanış animasyonunu tetikleme
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(), 300); // Animasyon süresinden sonra modalı kapat
  };

  useEffect(() => {
    let mounted = true;
    async function load() {
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
  }, [getAuthToken]);

  async function handleSendTo(uid) {
  if (!postId || !uid) {
    console.error("Geçersiz postId veya uid.");
    return;
  }
  try {
    setSendingTo(uid);
    // Yeni çağrı şekli: Parametreleri bir obje içinde gönder
    await sendShareRemote({ 
      targetType: 'post', 
      targetId: postId, 
      receiverUid: uid,
      getAuthToken // getAuthToken fonksiyonunu da objeye ekleyin
    });
    console.log("Paylaşım başarılı.");
    handleClose();
    if (onSuccess) onSuccess();
  } catch (e) {
    console.error("Gönderilemedi:", e);
    alert(`Gönderme hatası: ${e.message}`);
  } finally {
    setSendingTo(null);
  }
}

  // Yeni fonksiyon: Sosyal medyada paylaşım yapıldığında API çağrısını tetikler.
  async function handleExternalShare() {
  try {
    const token = await getAuthToken();
    // Bu fonksiyon sadece paylaşım istatistiğini artırmak için çağrılır.
    await getShareLinkRemote({ targetType: 'post', targetId: postId, token });
  } catch (e) {
    console.error("Harici paylaşım API çağrısı başarısız oldu:", e);
  }
}

  async function handleCopyLink() {
    try {
      const link = `${window.location.origin}/feelings/${postId}`;
      await navigator.clipboard.writeText(link);
      alert("Link kopyalandı!");
      handleExternalShare();
    } catch (e) {
      console.error("Kopyalanamadı:", e);
      alert("Kopyalanamadı: " + e.message);
    }
  }

  // Sosyal medya butonları ve fonksiyonları
  const socialButtons = [
    {
      name: "WhatsApp",
      icon: <FaWhatsapp />,
      action: () => {
        handleExternalShare();
        window.open(
          `https://wa.me/?text=${encodeURIComponent(
            `${window.location.origin}/feelings/${postId}`
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
            `${window.location.origin}/feelings/${postId}`
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
        handleCopyLink();
        alert("Link kopyalandı, Instagram'da manuel olarak paylaşabilirsiniz.");
      },
    },
    {
      name: "TikTok",
      icon: <FaTiktok />,
      action: () => {
        handleExternalShare();
        handleCopyLink();
        alert("Link kopyalandı, TikTok'ta manuel olarak paylaşabilirsiniz.");
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
          ) : users.length === 0 ? (
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
          )}
        </div>

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
