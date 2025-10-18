import React, { useState, useEffect } from "react";
import styles from "./BlockedUsers.module.css";
import { FiUserX, FiXCircle } from "react-icons/fi";
import { useAuth } from "../../../../context/AuthProvider"; // Auth context'i import et
import axios from "axios";
import LoadingOverlay from "../../../LoadingOverlay/LoadingOverlay"; // Yükleniyor ekranı

// Varsayılan avatar (eğer kullanıcının fotoğrafı yoksa)
const DEFAULT_AVATAR = "https://i.pinimg.com/736x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg";

const BlockedUsers = () => {
  const [blocked, setBlocked] = useState([]); // Başlangıçta boş
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null); // Hangi butonun engeli kaldırdığını takip et
  const { currentUser, showToast } = useAuth();
  const apiBaseUrl = process.env.REACT_APP_API_URL;

  // 1. Engellenen kullanıcıları API'den çek
  useEffect(() => {
    const fetchBlockedUsers = async () => {
      if (!currentUser) return;
      setLoading(true);

      try {
        const idToken = await currentUser.getIdToken();
        const response = await axios.get(
          `${apiBaseUrl}/api/users/blocked-list`,
          {
            headers: { Authorization: `Bearer ${idToken}` },
          }
        );
        // Gelen veri { blockedUsers: [...] } şeklindedir
        setBlocked(response.data.blockedUsers);
      } catch (error) {
        console.error("Engellenen kullanıcıları çekerken hata:", error);
        showToast("Engellenen kullanıcılar yüklenemedi.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchBlockedUsers();
  }, [currentUser, apiBaseUrl, showToast]);

  // 2. Engeli kaldırma fonksiyonu
  const handleUnblockUser = async (targetUid) => {
    if (processingId) return; // Zaten bir işlem varsa beklet
    setProcessingId(targetUid); // İşlemi başlat

    try {
      const idToken = await currentUser.getIdToken();
      
      // API'ye DELETE isteği at (userRoutes.js'deki rotayı kullan)
      await axios.delete(
        `${apiBaseUrl}/api/users/unblock/${targetUid}`,
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );

      // ✅ DÜZELTME: Filtreleme 'uid' alanına göre yapılmalı
      // Başarılı olursa, state'den (ekrandan) kullanıcıyı kaldır
      setBlocked((prev) =>
        prev.filter((user) => user.uid !== targetUid)
      );
      showToast("Kullanıcının engeli kaldırıldı.", "success");

    } catch (error) {
      console.error("Engeli kaldırma hatası:", error);
      showToast("Engeli kaldırırken bir hata oluştu.", "error");
    } finally {
      setProcessingId(null); // İşlemi bitir
    }
  };

  if (loading) {
    return <LoadingOverlay />;
  }

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>
        <FiUserX /> Engellenen Kullanıcılar
      </h2>
      <p className={styles.subtext}>
        Sizinle etkileşime girmesini engellediğiniz kişileri yönetin.
      </p>

      {blocked.length === 0 ? (
        <p className={styles.empty}>Henüz kimseyi engellemediniz.</p>
      ) : (
        <div className={styles.list}>
          {blocked.map((user) => (
            // ✅ DÜZELTME: key olarak 'blockedUid' yerine 'uid' kullan
            <div key={user.uid} className={styles.card}>
              <img 
                src={user.blockedPhotoURL || DEFAULT_AVATAR} 
                alt={user.blockedUsername} 
                className={styles.avatar} 
              />
              {/* ✅ GÜNCELLEME: Tasarım isteği (Sadece username) */}
              <div className={styles.info}>
                {/* <span className={styles.displayName}>{user.blockedDisplayName}</span> KALDIRILDI */}
                <span className={styles.username}>@{user.blockedUsername}</span>
              </div>
              <button 
                className={styles.unblockBtn} 
                // ✅ DÜZELTME: 'blockedUid' yerine 'uid' gönder
                onClick={() => handleUnblockUser(user.uid)}
                // ✅ DÜZELTME: 'blockedUid' yerine 'uid' ile karşılaştır
                disabled={processingId === user.uid} 
              >
                {/* ✅ DÜZELTME: 'blockedUid' yerine 'uid' ile karşılaştır */}
                {processingId === user.uid ? (
                  "Kaldırılıyor..."
                ) : (
                  <>
                    <FiXCircle /> Engeli Kaldır
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlockedUsers;