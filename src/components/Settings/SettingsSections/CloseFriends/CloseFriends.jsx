import React, { useState, useEffect } from "react";
import styles from "./CloseFriends.module.css";
import { FiUserCheck, FiUserPlus } from "react-icons/fi";
import { useAuth } from "../../../../context/AuthProvider"; // Auth context'i import et
import axios from "axios";
import LoadingOverlay from "../../../LoadingOverlay/LoadingOverlay"; // Yükleniyor ekranı

// Varsayılan avatar
const DEFAULT_AVATAR = "https://i.pinimg.com/736x/3c/ae/07/3cae079ca0b9e55ec6bfc1b358c9b1e2.jpg";

const CloseFriends = () => {
  const [users, setUsers] = useState([]); // Başlangıçta boş
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null); // Hangi butona basıldığını takip et
  const { currentUser, showToast } = useAuth();
  const apiBaseUrl = process.env.REACT_APP_API_URL;

  // 1. Takip edilen tüm kullanıcıları API'den çek
  useEffect(() => {
    const fetchFollowingList = async () => {
      if (!currentUser) return;
      setLoading(true);
      try {
        const idToken = await currentUser.getIdToken();
        
        // ✅ GÜNCELLENDİ: Yeni API endpoint'ini çağır
        const response = await axios.get(
          `${apiBaseUrl}/api/users/close-friends/list`,
          {
            headers: { Authorization: `Bearer ${idToken}` },
          }
        );
        
        // ✅ GÜNCELLENDİ: 'mutuals' yerine 'following' kullan
        // Gelen veri { following: [...] } şeklindedir
        // Her kullanıcıda { uid, username, displayName, photoURL, isClose } var
        setUsers(response.data.following);

      } catch (error) {
        console.error("Takip listesi çekilirken hata:", error);
        showToast("Liste yüklenemedi.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchFollowingList();
  }, [currentUser, apiBaseUrl, showToast]);

  // 2. Yakın arkadaş ekle/çıkar fonksiyonu (Bu fonksiyon zaten doğru çalışıyor)
  const toggleCloseFriend = async (user) => {
    if (processingId) return; // Zaten bir işlem varsa beklet
    setProcessingId(user.uid); // İşlemi başlat

    const isCurrentlyClose = user.isClose;
    const endpoint = isCurrentlyClose
      ? `/api/users/close-friends/remove/${user.uid}`
      : `/api/users/close-friends/add/${user.uid}`;
    const method = isCurrentlyClose ? "DELETE" : "POST";

    try {
      const idToken = await currentUser.getIdToken();
      await axios({
        method: method,
        url: `${apiBaseUrl}${endpoint}`,
        headers: { Authorization: `Bearer ${idToken}` },
      });

      // Başarılı olursa, state'i (ekranı) güncelle
      setUsers((prev) =>
        prev.map((u) =>
          u.uid === user.uid ? { ...u, isClose: !u.isClose } : u
        )
      );
      showToast(
        isCurrentlyClose
          ? "Yakın arkadaşlardan çıkarıldı."
          : "Yakın arkadaşlara eklendi.",
        "success"
      );
    } catch (error) {
      console.error("Yakın arkadaş güncelleme hatası:", error);
      showToast("İşlem başarısız oldu.", "error");
    } finally {
      setProcessingId(null); // İşlemi bitir
    }
  };

  if (loading) {
    return <LoadingOverlay />;
  }

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>Yakın Arkadaşlar</h2>
      
      {/* ✅ GÜNCELLENDİ: Açıklama metni */}
      <p className={styles.subtext}>
        Takip ettiğiniz kişileri yakın arkadaş listenize ekleyebilir veya
        listenizden çıkarabilirsiniz.
      </p>

      {users.length === 0 ? (
        <p className={styles.subtext} style={{ textAlign: "center", marginTop: "2rem" }}>
          Listeniz boş. Yakın arkadaş eklemek için önce birilerini takip etmeniz
          gerekir.
        </p>
      ) : (
        <div className={styles.grid}>
          {users.map((user) => (
            <div
              key={user.uid}
              className={`${styles.card} ${user.isClose ? styles.close : ""}`}
            >
              {/* cardHeader'ı avatar ve info'yu sarmak için kullanıyoruz */}
              <div className={styles.cardHeader}>
                <img
                  src={user.photoURL || DEFAULT_AVATAR}
                  alt={user.displayName}
                  className={styles.avatar}
                />
                {/* ✅ YENİ: Bilgi (info) sarmalayıcısı */}
                <div className={styles.info}>
                  <h4 className={styles.name}>{user.displayName}</h4>
                  {/* ✅ YENİ: 'subtext' yerine 'username' sınıfı */}
                  <p className={styles.username}>
                    @{user.username}
                  </p>
                </div>
              </div>
              
              {/* Eylem butonu kartın alt kısmında */}
              <button
                className={styles.action}
                onClick={() => toggleCloseFriend(user)}
                disabled={processingId === user.uid} // İşlem sırasındaysa butonu kilitle
              >
                {processingId === user.uid ? (
                  "İşleniyor..."
                ) : user.isClose ? (
                  <>
                    <FiUserCheck /> Yakın Arkadaş
                  </>
                ) : (
                  <>
                    <FiUserPlus /> Ekle
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

export default CloseFriends;