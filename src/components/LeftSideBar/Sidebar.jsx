import React from "react";
import { NavLink } from "react-router-dom";
import LeftSideBarStyles from "./Sidebar.module.css";
import {
  FiHome,
  FiBell,
  FiMessageSquare,
  FiVideo,
  FiBookmark,
  FiUser,
} from "react-icons/fi";
import { MdOutlineAddBox } from "react-icons/md";
import { SiApostrophe } from "react-icons/si";


const Sidebar = () => {
  return (
    <aside className={LeftSideBarStyles.sidebar}>
      <NavLink to="/home" className={LeftSideBarStyles.logo}>
        W1
      </NavLink>

      <nav className={LeftSideBarStyles.nav}>
        <NavLink
          to="/home"
          className={({ isActive }) => (isActive ? LeftSideBarStyles.active : LeftSideBarStyles.link)}
        >
          <FiHome className={LeftSideBarStyles.icon} />
          <span className={LeftSideBarStyles.tooltip}>Home</span>
        </NavLink>

        <NavLink
          to="/notifications"
          className={({ isActive }) => (isActive ? LeftSideBarStyles.active : LeftSideBarStyles.link)}
        >
          <FiBell className={LeftSideBarStyles.icon} />
          <span className={LeftSideBarStyles.tooltip}>Bildirimler</span>
        </NavLink>

        <NavLink
          to="/messages"
          className={({ isActive }) => (isActive ? LeftSideBarStyles.active : LeftSideBarStyles.link)}
        >
          <FiMessageSquare className={LeftSideBarStyles.icon} />
          <span className={LeftSideBarStyles.tooltip}>Mesajlar</span>
        </NavLink>

        <NavLink
          to="/discover"
          className={({ isActive }) => (isActive ? LeftSideBarStyles.active : LeftSideBarStyles.link)}
        >
          <SiApostrophe className={LeftSideBarStyles.icon + ' ' + LeftSideBarStyles.SiApostrophe} />
          <span className={LeftSideBarStyles.tooltip}>Keşfet</span>
        </NavLink>

        <NavLink
          to="/saved"
          className={({ isActive }) => (isActive ? LeftSideBarStyles.active : LeftSideBarStyles.link)}
        >
          <FiBookmark className={LeftSideBarStyles.icon} />
          <span className={LeftSideBarStyles.tooltip}>Kayıtlar</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) => (isActive ? LeftSideBarStyles.active : LeftSideBarStyles.link)}
        >
          <FiUser className={LeftSideBarStyles.icon} />
          <span className={LeftSideBarStyles.tooltip}>Hesabım</span>
        </NavLink>
      </nav>

      <div className={LeftSideBarStyles.post}>
        <NavLink to="/create" className={LeftSideBarStyles.createButton}>
          <MdOutlineAddBox className={LeftSideBarStyles.createIcon} />
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
