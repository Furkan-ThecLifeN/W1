import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import LeftSideBarStyles from "./Sidebar.module.css";
import { SiHearthisdotat } from "react-icons/si";
import {
  BiSolidHome,
  BiSolidMessageSquareDots,
  BiSolidNotification,
} from "react-icons/bi";
import { FaLocationArrow, FaUserAlt } from "react-icons/fa";
import { PiVideoFill } from "react-icons/pi";
import axios from "axios";
import { useAuth } from "../../context/AuthProvider";

const Sidebar = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { currentUser } = useAuth();
  const apiBaseUrl = process.env.REACT_APP_API_URL;

  const fetchUnreadCount = async () => {
    if (!currentUser) {
      setUnreadCount(0);
      return;
    }
    try {
      const idToken = await currentUser.getIdToken();
      const response = await axios.get(
        `${apiBaseUrl}/api/users/notifications/unread-count`,
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error(
        "Okunmamış bildirim sayısını çekme hatası:",
        error.response?.data?.error || error.message
      );
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    // Öneri: Sunucuyu yormamak için bu aralığı 5000ms (5 saniye) gibi bir değere çekebilirsiniz.
    const intervalId = setInterval(fetchUnreadCount, 5000);
    return () => clearInterval(intervalId);
  }, [currentUser, apiBaseUrl]);

  return (
    <aside className={LeftSideBarStyles.sidebar}>
      <NavLink to="/home" className={LeftSideBarStyles.logo}>
        W1
      </NavLink>

      <nav className={LeftSideBarStyles.nav}>
        <NavLink
          to="/home"
          className={({ isActive }) =>
            isActive ? LeftSideBarStyles.active : LeftSideBarStyles.link
          }
        >
          <BiSolidHome className={LeftSideBarStyles.icon} />
          <span className={LeftSideBarStyles.tooltip}>Home</span>
        </NavLink>

        <NavLink
          to="/notifications"
          className={({ isActive }) =>
            isActive ? LeftSideBarStyles.active : LeftSideBarStyles.link
          }
          onClick={() => unreadCount > 0 && setUnreadCount(0)}
        >
          <div className={LeftSideBarStyles.notification_icon_wrapper}>
            <BiSolidNotification className={LeftSideBarStyles.icon} />
            <span className={LeftSideBarStyles.tooltip}>Bildirimler</span>
            {unreadCount > 0 && (
              <span className={LeftSideBarStyles.notification_badge}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
        </NavLink>

        <NavLink
          to="/messages"
          className={({ isActive }) =>
            isActive ? LeftSideBarStyles.active : LeftSideBarStyles.link
          }
        >
          <BiSolidMessageSquareDots className={LeftSideBarStyles.icon} />
          <span className={LeftSideBarStyles.tooltip}>Mesajlar</span>
        </NavLink>

        <NavLink
          to="/discover"
          className={({ isActive }) =>
            isActive ? LeftSideBarStyles.active : LeftSideBarStyles.link
          }
        >
          <PiVideoFill
            className={
              LeftSideBarStyles.icon + " " + LeftSideBarStyles.SiApostrophe
            }
          />
          <span className={LeftSideBarStyles.tooltip}>Keşfet</span>
        </NavLink>

        {/* "Yakında Gelecek" Butonu - Parlama Efektli Tasarım */}
       {/*  <div
          className={`${LeftSideBarStyles.link} ${LeftSideBarStyles.disabled_link}`}
        >
          <div className={LeftSideBarStyles.icon_wrapper}>
            <SiHearthisdotat className={LeftSideBarStyles.icon} />
            <span className={LeftSideBarStyles.glow_effect}></span>
          </div>
          <span className={LeftSideBarStyles.tooltip}>VoCentra (Yakında)</span>
        </div> */}

        <NavLink
          to="/account"
          className={({ isActive }) =>
            isActive ? LeftSideBarStyles.active : LeftSideBarStyles.link
          }
        >
          <FaUserAlt className={LeftSideBarStyles.icon} />
          <span className={LeftSideBarStyles.tooltip}>Hesabım</span>
        </NavLink>
      </nav>

      <div className={LeftSideBarStyles.post}>
        <NavLink
          to="/create"
          className={({ isActive }) =>
            isActive ? LeftSideBarStyles.active : LeftSideBarStyles.link
          }
        >
          <FaLocationArrow className={LeftSideBarStyles.icon} />
          <span className={LeftSideBarStyles.tooltip}>İçerik Ekle</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;