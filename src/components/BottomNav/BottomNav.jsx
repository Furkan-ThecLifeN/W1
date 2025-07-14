import React from "react";
import { NavLink } from "react-router-dom";
import styles from "./BottomNav.module.css";
import {
  FiHome,
  FiBell,
  FiMessageSquare,
  FiBookmark,
  FiUser,
} from "react-icons/fi";
import { MdOutlineAddBox } from "react-icons/md";
import { SiApostrophe } from "react-icons/si";

const BottomNav = () => {
  return (
    <div className={styles.navContainer}>
      <nav className={styles.bottomNav}>
        <NavLink to="/home" className={({ isActive }) => (isActive ? styles.activeLink : styles.navLink)}>
          <FiHome className={styles.icon} />
        </NavLink>

        <NavLink to="/notifications" className={({ isActive }) => (isActive ? styles.activeLink : styles.navLink)}>
          <FiBell className={styles.icon} />
        </NavLink>

        <NavLink to="/messages" className={({ isActive }) => (isActive ? styles.activeLink : styles.navLink)}>
          <FiMessageSquare className={styles.icon} />
        </NavLink>

        <NavLink to="/create" className={styles.createButton}>
          <MdOutlineAddBox className={styles.createIcon} />
        </NavLink>

        <NavLink to="/discover" className={({ isActive }) => (isActive ? styles.activeLink : styles.navLink)}>
          <SiApostrophe className={styles.icon} />
        </NavLink>

        <NavLink to="/saved" className={({ isActive }) => (isActive ? styles.activeLink : styles.navLink)}>
          <FiBookmark className={styles.icon} />
        </NavLink>

        <NavLink to="/profile" className={({ isActive }) => (isActive ? styles.activeLink : styles.navLink)}>
          <FiUser className={styles.icon} />
        </NavLink>

      </nav>
    </div>
  );
};

export default BottomNav;
