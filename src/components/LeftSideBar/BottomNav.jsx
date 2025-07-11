import React from "react";
import { NavLink } from "react-router-dom";
import styles from "./BottomNav.module.css";
import { FiHome, FiUser, FiMessageCircle, FiBell } from "react-icons/fi";
import { MdOutlineSlowMotionVideo, MdAdd } from "react-icons/md";
import { HiOutlineSpeakerWave } from "react-icons/hi2";

const BottomNav = () => {
  return (
    <div className={styles.floatingNavWrapper}>
      <nav className={styles.bottomNav}>
        <NavLink
          to="/home"
          className={({ isActive }) => (isActive ? styles.active : styles.link)}
        >
          <FiHome />
        </NavLink>

        <NavLink
          to="/messages"
          className={({ isActive }) => (isActive ? styles.active : styles.link)}
        >
          <FiMessageCircle />
        </NavLink>

        <NavLink
          to="/notifications"
          className={({ isActive }) => (isActive ? styles.active : styles.link)}
        >
          <FiBell />
        </NavLink>

        <div className={styles.createWrapper}>
          <NavLink to="/create" className={styles.createButton}>
            <MdAdd />
          </NavLink>
        </div>

        <NavLink
          to="/discover"
          className={({ isActive }) => (isActive ? styles.active : styles.link)}
        >
          <MdOutlineSlowMotionVideo />
        </NavLink>

        <NavLink
          to="/saved"
          className={({ isActive }) => (isActive ? styles.active : styles.link)}
        >
          <HiOutlineSpeakerWave />
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) => (isActive ? styles.active : styles.link)}
        >
          <FiUser />
        </NavLink>
      </nav>
    </div>
  );
};

export default BottomNav;
