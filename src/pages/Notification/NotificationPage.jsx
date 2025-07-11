import React from "react";
import Sidebar from "../../components/LeftSideBar/Sidebar";
import Notification from "../../components/Notification/Notification";
import Styles from "./NotificationPage.module.css";
import BottomNav from "../../components/LeftSideBar/BottomNav";
import BottomSwipeNav from "../../components/BottomSwipeNav/BottomSwipeNav";

const NotificationsPage = () => {
  return (
    <div className={Styles.notification_container}>
      <Sidebar />
      <Notification />
      <BottomSwipeNav /> 
    </div>
  );
};

export default NotificationsPage;
