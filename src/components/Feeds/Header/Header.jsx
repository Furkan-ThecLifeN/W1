import React, { useState } from "react";
import styles from "./Header.module.css";
import BottomNav from "../BottomNav/BottomNav"; // yolunu kontrol et
import { MdMenu } from "react-icons/md";

export default function Header() {
  const [showNav, setShowNav] = useState(false);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.adBanner}>
          Bu alana reklam yerleştirilebilir
          <button
            className={styles.toggleNavBtn}
            onClick={() => setShowNav(!showNav)}
          >
            <MdMenu />
          </button>
        </div>
      </header>
      {showNav && <BottomNav />}
    </>
  );
}
