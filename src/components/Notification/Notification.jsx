// Notification.jsx (GÜNCEL)
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
import LoadingOverlay from "../LoadingOverlay/LoadingOverlay";
import axios from "axios"; 

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, showToast } = useAuth(); 
  const apiBaseUrl = process.env.REACT_APP_API_URL;

  // Yeni fonksiyon: Tüm okunmamış bildirimleri okundu olarak işaretle
  const markNotificationsRead = async () => {
    if (!currentUser) return;
    try {
      const idToken = await currentUser.getIdToken();
      // Backend'deki markNotificationsAsRead rotasını çağır
      await axios.patch(`${apiBaseUrl}/api/users/notifications/read`, {}, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      
      // API çağrısı başarılıysa, mevcut listedeki okunmamış olanları da okundu olarak işaretle.
      // Bu, sayfa yenilenene kadar rozetin görünmemesini sağlar.
      setNotifications(prev => prev.map(item => ({...item, isRead: true})));

    } catch (error) {
      console.error("Bildirimleri okundu olarak işaretleme hatası:", error);
    }
  };


  const fetchNotifications = async () => {
    setLoading(true);
    if (!currentUser) { // Kullanıcı yoksa yüklemeyi bitir.
        setLoading(false);
        return;
    }
    
    try {
      const idToken = await currentUser.getIdToken();
      const response = await axios.get(`${apiBaseUrl}/api/users/notifications`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      const allNotifications = response.data.notifications;

      // follow_request'leri grupla: aynı kullanıcıdan gelenleri tek bir bildirimde göster
      const uniqueFollowRequests = {};
      const otherNotifications = [];

      allNotifications.forEach(item => {
        if (item.type === "follow_request") {
          // Sadece en son takip isteğini göster
          if (!uniqueFollowRequests[item.fromUid] || new Date(item.createdAt) > new Date(uniqueFollowRequests[item.fromUid].createdAt)) {
            uniqueFollowRequests[item.fromUid] = item;
          }
        } else {
          otherNotifications.push(item);
        }
      });

      const combinedNotifications = [
        ...Object.values(uniqueFollowRequests),
        ...otherNotifications.filter(item => item.type !== "follow_accepted" && item.type !== "follow_rejected"), // Takip onayı/reddi artık bildirim listesinde ayrı gösterilir
      ];

      const sortedNotifications = combinedNotifications.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setNotifications(sortedNotifications);
    } catch (error) {
      console.error("Bildirimler getirilirken hata oluştu:", error);
      showToast("Bildirimler yüklenirken bir sorun oluştu.", "error");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowRequest = async (requesterUid, action) => {
    setLoading(true);
    try {
      const idToken = await currentUser.getIdToken();
      // Takip isteğini onaylama/reddetme rotası
      const endpoint = `${apiBaseUrl}/api/users/follow/${action}/${requesterUid}`; 

      const response = await axios.post(endpoint, {}, {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      showToast(response.data.message, "success");
      await fetchNotifications(); // İşlem sonrası listeyi yeniden çek
    } catch (error) {
      console.error("Takip isteği işlem hatası:", error);
      showToast(
        error.response?.data?.error || "İşlem başarısız oldu.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const getNotificationContent = (item) => {
    switch (item.type) {
      case "follow_request":
        return {
          message: "sana takip isteği gönderdi.",
          icon: <FaUserPlus size={20} color="var(--color-blue)" />,
        };
      case "follow_accepted":
        return {
          message: "takip isteğini onayladı.",
          icon: <FaCheckCircle size={20} color="#27ae60" />,
        };
      case "follow_rejected":
        return {
          message: "takip isteğini reddetti.",
          icon: <FaCheckCircle size={20} color="#e74c3c" />,
        };
      case "new_follower":
        return {
          message: "seni takip etmeye başladı.",
          icon: <FaUserPlus size={20} color="var(--color-blue)" />,
        };
      case "like":
        return {
          message: "gönderini beğendi.",
          icon: <FaHeart size={20} color="var(--busy)" />,
          link: `/post/${item.postId}`,
        };
      case "comment":
        return {
          message: (
            <>
              gönderine yorum yaptı:{" "}
              <strong>"{item.content || item.commentText}..."</strong>
            </>
          ),
          icon: <FaRegCommentDots size={20} color="#3498db" />,
          link: `/post/${item.postId}`,
        };
      default:
        return { message: "Yeni bildirim.", icon: null };
    }
  };

  useEffect(() => {
    fetchNotifications();
    markNotificationsRead(); // Sayfaya girildiği anda okundu olarak işaretle
  }, [currentUser, apiBaseUrl]); 

  return (
    <div className={styles.notification_page}>
      <h2 className={styles.page_title}>Bildirimler</h2>
      {loading ? (
        <LoadingOverlay />
      ) : notifications.length > 0 ? (
        <ul className={styles.notification_list}>
          {notifications.map((item) => {
            const { message, icon, link } = getNotificationContent(item);
            return (
              <li
                key={item.id}
                // isRead=false ise "unread" sınıfını uygula
                className={`${styles.notification_item} ${!item.isRead ? styles.unread : ""}`}
              >
                <div className={styles.icon_wrapper}>{icon}</div>
                <div className={styles.text_wrapper}>
                  <div>
                    <Link
                      to={`/profile/${item.fromUsername}`}
                      className={styles.username}
                    >
                      {item.fromUsername}
                    </Link>{" "}
                    <span className={styles.message}>
                      {link ? (
                        <Link to={link} className={styles.comment_link}>
                          {message}
                        </Link>
                      ) : (
                        message
                      )}
                    </span>
                  </div>
                  <div className={styles.time}>
                    {item.createdAt && new Date(item.createdAt).toLocaleString()}
                  </div>
                  {item.type === "follow_request" && (
                    <div className={styles.button_group}>
                      <button
                        className={styles.accept_btn}
                        onClick={() =>
                          handleFollowRequest(item.fromUid, "accept")
                        }
                      >
                        Onayla
                      </button>
                      <button
                        className={styles.reject_btn}
                        onClick={() =>
                          handleFollowRequest(item.fromUid, "reject")
                        }
                      >
                        Reddet
                      </button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className={styles.noNotifications}>
          <FaRegCommentDots size={50} color="#666" />
          <p>Henüz bildirim yok.</p>
        </div>
      )}
    </div>
  );
};

export default Notification;