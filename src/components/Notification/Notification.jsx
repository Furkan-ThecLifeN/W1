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
import LoadingOverlay from "../LoadingOverlay/LoadingOverlay"; // Dosya yolunu doğru şekilde ayarlayın

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

  // Bildirimleri okundu olarak işaretleme
  const markAsRead = async () => {
    try {
      const idToken = await currentUser.getIdToken();
      await fetch(`${apiBaseUrl}/api/users/notifications/read`, {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
    } catch (error) {
      console.error("Bildirimleri okundu olarak işaretleme hatası:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Opsiyonel: Bildirimler sayfasına girildiğinde okundu işaretle
    // markAsRead();
  }, [currentUser, apiBaseUrl]);

  const handleFollowRequest = async (requesterUid, action) => {
    setLoading(true);
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
        fetchNotifications();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "İşlem başarısız oldu.");
        fetchNotifications();
      }
    } catch (error) {
      console.error("İşlem hatası:", error);
      alert("Bir hata oluştu.");
      fetchNotifications();
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
      case "new_follower":
        return {
          message: "seni takip etmeye başladı.",
          icon: <FaUserPlus size={20} color="var(--color-blue)" />,
        };
      case "follow_accepted":
        return {
          message: "takip isteğini onayladı.",
          icon: <FaCheckCircle size={20} color="#27ae60" />,
        };
      case "like":
        return {
          message: "gönderini beğendi.",
          icon: <FaHeart size={20} color="var(--busy)" />,
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
        };
      default:
        return { message: "Yeni bildirim.", icon: null };
    }
  };

  return (
    <div className={styles.notification_page}>
      <h2 className={styles.page_title}>Bildirimler</h2>
      {loading ? (
        <LoadingOverlay />
      ) : notifications.length > 0 ? (
        <ul className={styles.notification_list}>
          {notifications.map((item) => {
            const { message, icon } = getNotificationContent(item);
            return (
              <li
                key={item.id}
                className={`${styles.notification_item} ${
                  !item.isRead ? styles.unread : ""
                }`}
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
                    <span className={styles.message}>{message}</span>
                  </div>
                  <div className={styles.time}>
                    {new Date(item.createdAt).toLocaleString()}
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
