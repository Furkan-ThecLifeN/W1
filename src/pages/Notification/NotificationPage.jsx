import React from "react";
import Sidebar from "../../components/LeftSideBar/Sidebar";
import Notification from "../../components/Notification/Notification";
import Styles from "./NotificationPage.module.css";
import BottomNav from "../../components/LeftSideBar/BottomNav";
import BottomToggleNav from "../../components/BottomToggleNav/BottomToggleNav";

const NotificationsPage = () => {
  return (
    <div className={Styles.notification_container}>
      <Sidebar />
      <Notification />
      <BottomToggleNav /> 
    </div>
  );
};

export default NotificationsPage;
