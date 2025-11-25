import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import styles from "./BottomNav.module.css";
import { FiHome, FiBell, FiUser, FiChevronDown } from "react-icons/fi"; // Chevron eklendi
import { SiHearthisdotat } from "react-icons/si";
import { BiSolidMessageSquareDots } from "react-icons/bi";
import { PiVideoFill } from "react-icons/pi";
import { FaLocationArrow } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import { RiMenu4Fill } from "react-icons/ri"; // Menü ikonu

const BottomNav = () => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      {/* AÇMA/KAPAMA BUTONU 
         Bu buton navContainer'dan bağımsız, sağ altta sabit duracak.
      */}
      <button 
        className={`${styles.toggleButton} ${isVisible ? styles.toggleActive : ''}`} 
        onClick={() => setIsVisible(!isVisible)}
      >
        {isVisible ? <FiChevronDown /> : <RiMenu4Fill />}
      </button>

      {/* NAV KONTEYNERİ 
         isVisible false ise 'hidden' stili eklenir.
      */}
      <div className={`${styles.navContainer} ${!isVisible ? styles.navHidden : ''}`}>
        <nav className={styles.bottomNav}>
          {/* 1. Home */}
          <NavLink to="/home" className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}>
            <FiHome className={styles.icon} />
          </NavLink>

          {/* 2. Notifications */}
          <NavLink to="/notifications" className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}>
            <FiBell className={styles.icon} />
          </NavLink>

          {/* 3. Messages */}
          <NavLink to="/messages" className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}>
            <BiSolidMessageSquareDots className={styles.icon} />
          </NavLink>

          {/* 4. Create (Center) */}
          <NavLink to="/create" className={styles.createButton}>
            <FaLocationArrow className={styles.createIcon} />
          </NavLink>

          {/* 5. Discover */}
          <NavLink to="/discover" className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}>
            <PiVideoFill className={styles.icon} />
          </NavLink>

          {/* 6. Search */}
          <NavLink to="/search" className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}>
            <IoSearch className={styles.icon} />
          </NavLink>

          {/* 7. Account */}
          <NavLink to="/account" className={({ isActive }) => isActive ? styles.activeLink : styles.navLink}>
            <FiUser className={styles.icon} />
          </NavLink>
        </nav>
      </div>
    </>
  );
};

export default BottomNav;