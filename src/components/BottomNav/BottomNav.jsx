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
import { SiApostrophe, SiHearthisdotat } from "react-icons/si";
import { BiSolidMessageSquareDots } from "react-icons/bi";

const BottomNav = () => {
  return (
    <div className={styles.navContainer}>
      <nav className={styles.bottomNav}>
        <NavLink
          to="/home"
          className={({ isActive }) =>
            isActive ? styles.activeLink : styles.navLink
          }
        >
          <FiHome className={styles.icon} />
        </NavLink>

        <NavLink
          to="/notifications"
          className={({ isActive }) =>
            isActive ? styles.activeLink : styles.navLink
          }
        >
          <FiBell className={styles.icon} />
        </NavLink>

        <NavLink
          to="/messages"
          className={({ isActive }) =>
            isActive ? styles.activeLink : styles.navLink
          }
        >
          <BiSolidMessageSquareDots className={styles.icon} />
        </NavLink>

        <NavLink to="/create" className={styles.createButton}>
          <MdOutlineAddBox className={styles.createIcon} />
        </NavLink>

        <NavLink
          to="/discover"
          className={({ isActive }) =>
            isActive ? styles.activeLink : styles.navLink
          }
        >
          <SiApostrophe className={styles.icon} />
        </NavLink>

        <NavLink
          to="/vocentra"
          className={({ isActive }) =>
            isActive ? styles.activeLink : styles.navLink
          }
        >
          <SiHearthisdotat className={styles.icon} />
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            isActive ? styles.activeLink : styles.navLink
          }
        >
          <FiUser className={styles.icon} />
        </NavLink>
      </nav>
    </div>
  );
};

export default BottomNav;
