import React, { useState, useRef, useEffect } from "react";
import styles from "./BottomToggleNav.module.css";
import { MdAdd } from "react-icons/md";
import BottomNav from "../LeftSideBar/BottomNav";

const BottomToggleNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState({ x: 20, y: window.innerHeight / 2 - 28 }); // Orta yükseklik, kenara sabit
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleResize = () => {
      // Yüksekliğe göre pozisyonu koru, ekran küçülürse taşmasın
      setPos((prev) => ({
        x: Math.min(prev.x, window.innerWidth - 60),
        y: Math.min(prev.y, window.innerHeight - 60),
      }));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const onMouseDown = (e) => {
    dragging.current = true;
    offset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const onMouseMove = (e) => {
    if (!dragging.current) return;

    let newX = e.clientX - offset.current.x;
    let newY = e.clientY - offset.current.y;

    // Ekran sınırlarını aşmasın
    newX = Math.max(0, Math.min(newX, window.innerWidth - 60));
    newY = Math.max(0, Math.min(newY, window.innerHeight - 60));

    setPos({ x: newX, y: newY });
  };

  const onMouseUp = () => {
    dragging.current = false;
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };

  const toggleNav = () => {
    if (dragging.current) return;
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      <div
        className={styles.floatingButton}
        onMouseDown={onMouseDown}
        onClick={toggleNav}
        style={{
          left: pos.x + "px",
          top: pos.y + "px",
          position: "fixed",
        }}
      >
        <MdAdd className={styles.icon} />
      </div>

      <div
        className={`${styles.bottomNavWrapper} ${
          isOpen ? styles.show : styles.hide
        }`}
      >
        <BottomNav />
      </div>
    </>
  );
};

export default BottomToggleNav;
