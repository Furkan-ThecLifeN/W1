import React, { useState, useEffect, useCallback } from "react";
import styles from "./ConnectionsModal.module.css";
import UserCard from "../UserCard/UserCard";
import { IoCloseSharp } from "react-icons/io5";
import { getAuth } from "firebase/auth";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://w1-backend.onrender.com"
    : "http://localhost:3001";

const ConnectionsModal = ({ show, onClose, listType, currentUserId }) => {
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const modalTitle =
    listType === "followers" ? "Takipçiler" : "Takip Edilenler";

  const fetchConnections = useCallback(async () => {
    if (!currentUserId || !listType) return;

    setLoading(true);
    setError(null);

    const fetchUrl =
      listType === "followers"
        ? `${API_BASE}/api/users/${currentUserId}/followers`
        : `${API_BASE}/api/users/${currentUserId}/following`;

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Kullanıcı oturumu yok.");
      const idToken = await currentUser.getIdToken();

      const response = await fetch(fetchUrl, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: "Bilinmeyen sunucu hatası",
        }));
        throw new Error(errorData.error || "API isteği başarısız oldu.");
      }

      const data = await response.json();
      setUserList(data[listType] || []);
    } catch (err) {
      setError(err.message || "Kullanıcı listesi alınırken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, [listType, currentUserId]);

  useEffect(() => {
    if (show && currentUserId) fetchConnections();
  }, [show, currentUserId, fetchConnections]);

  const handleFollow = async (targetUid) => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Kullanıcı oturumu yok.");
      const idToken = await currentUser.getIdToken();

      await fetch(`${API_BASE}/api/users/follow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ targetUid }),
      });

      fetchConnections();
    } catch (err) {
      console.error("Takip etme hatası:", err);
    }
  };

  const handleUnfollow = async (targetUid) => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Kullanıcı oturumu yok.");
      const idToken = await currentUser.getIdToken();

      await fetch(`${API_BASE}/api/users/unfollow/${targetUid}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      fetchConnections();
    } catch (err) {
      console.error("Takipten çıkma hatası:", err);
    }
  };

  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{modalTitle}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <IoCloseSharp />
          </button>
        </div>

        <div className={styles.modalBody}>
          {loading && <div className={styles.message}>Yükleniyor...</div>}
          {error && <div className={`${styles.message} ${styles.error}`}>{error}</div>}
          {!loading && !error && userList.length === 0 && (
            <div className={styles.message}>Henüz kimse bulunmuyor.</div>
          )}
          {!loading && !error && userList.length > 0 && (
            <ul className={styles.userList}>
              {userList.map((user) => (
                <li key={user.uid}>
                  {/* UserCard içinde artık <li> yok, sadece <div> */}
                  <UserCard
                    user={user}
                    onFollow={handleFollow}
                    onUnfollow={handleUnfollow}
                    isCurrentUser={user.uid === currentUserId}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectionsModal;
