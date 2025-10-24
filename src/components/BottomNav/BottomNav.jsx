import React from "react";
import { NavLink } from "react-router-dom";
import styles from "./BottomNav.module.css";
import {
  FiHome,
  FiBell,
  FiUser,
} from "react-icons/fi";
import { SiHearthisdotat } from "react-icons/si";
import { BiSolidMessageSquareDots } from "react-icons/bi";
import { PiVideoFill } from "react-icons/pi";
import { FaLocationArrow } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";

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
          <FaLocationArrow  className={styles.createIcon} />
        </NavLink>

        <NavLink
          to="/discover"
          className={({ isActive }) =>
            isActive ? styles.activeLink : styles.navLink
          }
        >
          <PiVideoFill className={styles.icon} />
        </NavLink>

        <NavLink
          to="/search"
          className={({ isActive }) =>
            isActive ? styles.activeLink : styles.navLink
          }
        >
          <IoSearch className={styles.icon} />
        </NavLink>

        <NavLink
          to="/account"
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
