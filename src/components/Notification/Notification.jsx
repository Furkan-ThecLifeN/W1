import React, { useState, useEffect } from "react";
import styles from "./Notification.module.css";
import {
  FaUserPlus,
  FaHeart,
  FaRegCommentDots,
  FaCheckCircle,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthProvider";
import { Link } from "react-router-dom";

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const apiBaseUrl = process.env.REACT_APP_API_URL;

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const idToken = await currentUser.getIdToken();
      const response = await fetch(`${apiBaseUrl}/api/users/notifications`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      if (!response.ok) {
        throw new Error("Bildirimler getirilirken bir sorun oluştu.");
      }

      const data = await response.json();
      const sortedNotifications = data.notifications.sort((a, b) => {
        if (a.type === "follow_request" && b.type !== "follow_request") return -1;
        if (a.type !== "follow_request" && b.type === "follow_request") return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setNotifications(sortedNotifications);
    } catch (error) {
      console.error("Bildirimler getirilirken hata oluştu:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [currentUser, apiBaseUrl]);

  const handleFollowRequest = async (requesterUid, action) => {
    // UI'ı hemen güncelle: Takip isteği kartını listeden kaldır
    const updatedNotifications = notifications.filter(
      (n) => !(n.fromUid === requesterUid && n.type === "follow_request")
    );
    setNotifications(updatedNotifications);

    try {
      const idToken = await currentUser.getIdToken();
      const endpoint = `${apiBaseUrl}/api/users/follow/${action}/${requesterUid}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
      });

      if (response.ok) {
        // İşlem başarılı, yeni bildirimleri almak için listeyi yeniden çek
        fetchNotifications();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "İşlem başarısız oldu.");
        // Hata durumunda eski listeyi geri yükle
        fetchNotifications();
      }
    } catch (error) {
      console.error("İşlem hatası:", error);
      alert("Bir hata oluştu.");
      // Hata durumunda eski listeyi geri yükle
      fetchNotifications();
    }
  };

  const getNotificationText = (item) => {
    switch (item.type) {
      case "follow_request":
        return {
          message: "sana takip isteği gönderdi.",
          icon: <FaUserPlus />,
        };
      case "new_follower":
        return {
          message: "seni takip etmeye başladı.",
          icon: <FaUserPlus />,
        };
      case "follow_accepted":
        return {
          message: "takip isteğini onayladı.",
          icon: <FaCheckCircle />,
        };
      case "like":
        return {
          message: "gönderini beğendi.",
          icon: <FaHeart />,
        };
      case "comment":
        return {
          message: `gönderinize yorum yaptı: "${item.content}"`,
          icon: <FaRegCommentDots />,
        };
      default:
        return { message: "Yeni bildirim.", icon: null };
    }
  };

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className={styles.notification_page}>
      <h2 className={styles.page_title}>Bildirimler</h2>
      <ul className={styles.notification_list}>
        {notifications.length > 0 ? (
          notifications.map((item) => {
            const { message, icon } = getNotificationText(item);
            return (
              <li key={item.id} className={styles.notification_item}>
                <div className={styles.icon_wrapper}>{icon}</div>
                <div className={styles.text_wrapper}>
                  <div>
                    <Link to={`/profile/${item.fromUsername}`} className={styles.username}>
                      {item.fromUsername}
                    </Link>{" "}
                    <span className={styles.message}>{message}</span>
                  </div>
                  <div className={styles.time}>{new Date(item.createdAt).toLocaleString()}</div>

                  {item.type === "follow_request" && (
                    <div className={styles.button_group}>
                      <button
                        className={styles.accept_btn}
                        onClick={() => handleFollowRequest(item.fromUid, "accept")}
                      >
                        Onayla
                      </button>
                      <button
                        className={styles.reject_btn}
                        onClick={() => handleFollowRequest(item.fromUid, "reject")}
                      >
                        Reddet
                      </button>
                    </div>
                  )}
                </div>
              </li>
            );
          })
        ) : (
          <div className={styles.noNotifications}>
            <FaRegCommentDots size={50} color="#666" />
            <p>Henüz bildirim yok.</p>
          </div>
        )}
      </ul>
    </div>
  );
};

export default Notification;