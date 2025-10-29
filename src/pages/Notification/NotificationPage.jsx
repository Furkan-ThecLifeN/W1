import React, { useEffect } from "react";
import Sidebar from "../../components/LeftSideBar/Sidebar";
import Notification from "../../components/Notification/Notification";
import BottomNav from "../../components/BottomNav/BottomNav";
import Styles from "./NotificationPage.module.css";
import { useNotificationStore } from "../../Store/useNotificationStore";
import axios from "axios";
import PublicAccessWrapper from "../../components/PublicAccessWrapper/PublicAccessWrapper";

const NotificationsPage = () => {
  const { notifications, isLoaded, loading, setState } = useNotificationStore();

  useEffect(() => {
    let active = true;
    if (isLoaded) return;

    const fetchNotifications = async () => {
      try {
        setState({ loading: true });
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/notifications`);
        if (!active) return;
        setState({ notifications: res.data || [], isLoaded: true, loading: false });
      } catch (err) {
        if (!active) return;
        console.error("Bildirimleri getirirken hata:", err);
        setState({ loading: false });
      }
    };

    fetchNotifications();
    return () => {
      active = false;
    };
  }, [isLoaded]);

  return (
    <PublicAccessWrapper loginMessage="Bildirimleri görmek için giriş yapın.">
      <div className={Styles.notification_container}>
        <Sidebar />
        {loading && !isLoaded ? <p>Yükleniyor...</p> : <Notification data={notifications} />}
        <BottomNav />
      </div>
    </PublicAccessWrapper>
  );
};

export default NotificationsPage;
