// Notification.jsx
import React, { useEffect } from "react";
import styles from "./Notification.module.css";
import {
  FaUserPlus,
  FaHeart,
  FaRegCommentDots,
  FaCheckCircle,
} from "react-icons/fa";
import { MdDataSaverOff } from "react-icons/md";
import { useAuth } from "../../context/AuthProvider";
import { Link } from "react-router-dom";
import LoadingOverlay from "../LoadingOverlay/LoadingOverlay";
import axios from "axios";
import { useNotificationStore } from "../../Store/useNotificationStore";
import Footer from "../Footer/Footer";
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  writeBatch,
  doc,
} from "firebase/firestore";

const Notification = () => {
  const { notifications, loading, isLoaded, setState, reset } =
    useNotificationStore();
  const { currentUser, showToast } = useAuth();
  const apiBaseUrl = process.env.REACT_APP_API_URL;
  const db = getFirestore();

  // 🔹 Local notification-store'u temizleme
  const clearNotificationData = () => {
    try {
      localStorage.removeItem("notification-store");
      reset();
      showToast("Bildirim verileri temizlendi.", "success");
    } catch (err) {
      console.error("Temizleme hatası:", err);
      showToast("Veriler temizlenirken hata oluştu.", "error");
    }
  };

  // ========== Bildirimleri okundu yap (Firestore) ==========
  const markNotificationsRead = async () => {
    if (!currentUser) return;
    try {
      const notifRef = collection(
        db,
        "users",
        currentUser.uid,
        "notifications"
      );
      const q = query(notifRef, where("isRead", "==", false));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) return;

      const batch = writeBatch(db);
      querySnapshot.docs.forEach((docSnap) => {
        batch.update(docSnap.ref, { isRead: true });
      });
      await batch.commit();

      setState({
        notifications: notifications.map((n) => ({ ...n, isRead: true })),
      });
    } catch (error) {
      console.error("Bildirimleri okundu olarak işaretleme hatası:", error);
    }
  };

  // ========== Bildirimleri çek (Firestore) ==========
  const fetchNotifications = async () => {
    if (loading) return;
    setState({ loading: true });

    if (!currentUser) {
      setState({ loading: false });
      return;
    }

    try {
      const notifRef = collection(
        db,
        "users",
        currentUser.uid,
        "notifications"
      );
      const querySnapshot = await getDocs(notifRef);

      const allNotifications = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate().toISOString(),
      }));

      const uniqueFollowRequests = {};
      const otherNotifications = [];

      allNotifications.forEach((item) => {
        if (item.type === "follow_request") {
          if (
            !uniqueFollowRequests[item.fromUid] ||
            new Date(item.createdAt) >
              new Date(uniqueFollowRequests[item.fromUid].createdAt)
          ) {
            uniqueFollowRequests[item.fromUid] = item;
          }
        } else {
          otherNotifications.push(item);
        }
      });

      const combinedNotifications = [
        ...Object.values(uniqueFollowRequests),
        ...otherNotifications,
      ];

      const sortedNotifications = combinedNotifications.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setState({
        notifications: sortedNotifications,
        isLoaded: true,
        loading: false,
      });
    } catch (error) {
      console.error("Bildirimler getirilirken hata oluştu:", error);
      showToast("Bildirimler yüklenirken bir sorun oluştu.", "error");
      setState({ notifications: [], loading: false });
    }
  };

  // ========== Takip İsteği İşlemi ==========
  const handleFollowRequest = async (requesterUid, action) => {
    setState({ loading: true });
    try {
      const idToken = await currentUser.getIdToken();
      const endpoint = `${apiBaseUrl}/api/users/follow/${action}/${requesterUid}`;

      const response = await axios.post(
        endpoint,
        {},
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );

      showToast(response.data.message, "success");
      await fetchNotifications();
    } catch (error) {
      console.error("Takip isteği işlem hatası:", error);
      showToast(
        error.response?.data?.error || "İşlem başarısız oldu.",
        "error"
      );
    } finally {
      setState({ loading: false });
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
    if (!isLoaded) fetchNotifications();
    markNotificationsRead();
  }, [currentUser]);

  return (
    <div className={styles.notification_page}>
      <div className={styles.headerRow}>
        <h2 className={styles.page_title}>Bildirimler</h2>
        <button
          className={styles.clearNotificationsBtn}
          onClick={clearNotificationData}
        >
          <MdDataSaverOff /> Güncel Verileri Al
        </button>
      </div>

      {loading ? (
        <LoadingOverlay />
      ) : notifications.length > 0 ? (
        <ul className={styles.notification_list}>
          {notifications.map((item) => {
            const { message, icon, link } = getNotificationContent(item);
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
                    {item.createdAt &&
                      new Date(item.createdAt).toLocaleString()}
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
