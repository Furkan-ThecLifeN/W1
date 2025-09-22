import React, { useState, useEffect, useCallback, useRef } from "react";
import styles from "./ConnectionsModal.module.css";
import UserCard from "../UserCard/UserCard";
import { IoCloseSharp } from "react-icons/io5";
import { getAuth } from "firebase/auth";
import axios from "axios";
import { useAuth } from "../../context/AuthProvider";

const ConnectionsModal = ({ show, onClose, listType, currentUserId }) => {
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { currentUser, showToast } = useAuth();
  const idTokenRef = useRef(null);
  const axiosInstance = useRef(axios.create({
    baseURL: process.env.REACT_APP_API_URL,
  }));

  const modalTitle =
    listType === "followers" ? "Takipçiler" : "Takip Edilenler";

  // Kullanıcının kendi profiline mi baktığını kontrol et
  const isMyProfile = currentUser && currentUser.uid === currentUserId;

  const fetchConnections = useCallback(async () => {
    if (!currentUserId || !listType) return;
    setLoading(true);
    setError(null);

    try {
      if (!currentUser) throw new Error("Kullanıcı oturumu yok.");
      idTokenRef.current = await currentUser.getIdToken();

      const fetchUrl =
        listType === "followers"
          ? `/api/users/${currentUserId}/followers`
          : `/api/users/${currentUserId}/following`;

      const response = await axiosInstance.current.get(fetchUrl, {
        headers: {
          Authorization: `Bearer ${idTokenRef.current}`,
        },
      });
      
      const connections = response.data[listType] || [];

      // Her bir bağlantının takip durumunu çek
      const usersWithStatus = await Promise.all(
        connections.map(async (user) => {
          let followStatus = "none";
          try {
            const statusRes = await axiosInstance.current.get(
              `/api/users/profile/${user.uid}/status`,
              {
                headers: {
                  Authorization: `Bearer ${idTokenRef.current}`,
                },
              }
            );
            followStatus = statusRes.data.followStatus;
          } catch (e) {
            console.error("Takip durumu çekilemedi:", e);
          }
          return { ...user, followStatus };
        })
      );
      
      setUserList(usersWithStatus);
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        "Kullanıcı listesi alınırken bir hata oluştu.";
      setError(errorMsg);
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  }, [listType, currentUserId, currentUser, showToast]);

  useEffect(() => {
    if (show && currentUserId) fetchConnections();
  }, [show, currentUserId, fetchConnections]);

  const handleFollow = async (targetUid) => {
    try {
      const response = await axiosInstance.current.post(
        "/api/users/follow",
        { targetUid },
        {
          headers: {
            Authorization: `Bearer ${idTokenRef.current}`,
          },
        }
      );
      showToast(response.data.message, "success");
      // UI'ı anında güncelle
      setUserList(prevList => prevList.map(user => 
        user.uid === targetUid ? { ...user, followStatus: response.data.status } : user
      ));
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || "Takip etme başarısız oldu.";
      showToast(errorMsg, "error");
    }
  };

  const handleRemove = async (targetUid) => {
    try {
      let endpoint;
      if (listType === "followers") {
        endpoint = `/api/users/remove-follower/${targetUid}`;
      } else {
        endpoint = `/api/users/remove-following/${targetUid}`;
      }

      await axiosInstance.current.delete(endpoint, {
        headers: {
          Authorization: `Bearer ${idTokenRef.current}`,
        },
      });

      showToast("Kullanıcı başarıyla kaldırıldı.", "success");
      // Kaldırılan kullanıcıyı listeden filtreleyerek çıkar
      setUserList(prevList => prevList.filter(user => user.uid !== targetUid));
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || "Kullanıcıyı kaldıramadınız.";
      showToast(errorMsg, "error");
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
          {error && (
            <div className={`${styles.message} ${styles.error}`}>{error}</div>
          )}
          {!loading && !error && userList.length === 0 && (
            <div className={styles.message}>Henüz kimse bulunmuyor.</div>
          )}
          {!loading && !error && userList.length > 0 && (
            <ul className={styles.userList}>
              {userList.map((user) => (
                <li key={user.uid} className={styles.userLiCard}>
                  <UserCard
                    user={user}
                    // Kendi profilimizdeyken listeye göre farklı butonlar gösteririz
                    followStatus={isMyProfile ? (listType === "followers" ? "removeFollower" : "following") : user.followStatus}
                    onFollow={handleFollow}
                    onRemove={handleRemove}
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