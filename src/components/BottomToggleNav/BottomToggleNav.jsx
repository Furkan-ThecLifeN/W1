import React, { useState } from "react";
import BottomNav from "../../components/LeftSideBar/BottomNav";
import { MdMenu } from "react-icons/md";
import styles from "./BottomToggleNav.module.css";

const BottomToggleNav = () => {
  const [showNav, setShowNav] = useState(false);

  return (
    <>
      <button className={styles.toggleButton} onClick={() => setShowNav(!showNav)}>
        <MdMenu />
      </button>
      {showNav && <BottomNav />}
    </>
  );
};

export default BottomToggleNav;
