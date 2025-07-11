import React, { useState, useRef, useEffect } from "react";
import styles from "./BottomSwipeNav.module.css";
import BottomNav from "../LeftSideBar/BottomNav";

const BottomSwipeNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);
  const dragging = useRef(false);
  const [translateY, setTranslateY] = useState(100);

  // Animasyon tamamlandığında transition uygula
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTranslateY(100);
    } else {
      setTranslateY(0);
    }
  }, [isOpen]);

  // TOUCH EVENTS
  const onTouchStart = (e) => {
    dragging.current = true;
    setAnimating(false);
    startY.current = e.touches[0].clientY;
  };

  const onTouchMove = (e) => {
    if (!dragging.current) return;
    currentY.current = e.touches[0].clientY;
    handleMove();
  };

  const onTouchEnd = () => {
    dragging.current = false;
    finishMove();
  };

  // MOUSE EVENTS
  const onMouseDown = (e) => {
    dragging.current = true;
    setAnimating(false);
    startY.current = e.clientY;
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const onMouseMove = (e) => {
    if (!dragging.current) return;
    currentY.current = e.clientY;
    handleMove();
  };

  const onMouseUp = () => {
    dragging.current = false;
    finishMove();
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };

  // Hareketi hesapla ve translateY ayarla
  const handleMove = () => {
    let diff = currentY.current - startY.current;

    if (!isOpen && diff < 0) {
      // Açılma hareketi (yukarı sürükleme)
      let newTranslate = 100 + (diff / window.innerHeight) * 100;
      if (newTranslate < 0) newTranslate = 0;
      setTranslateY(newTranslate);
    } else if (isOpen && diff > 0) {
      // Kapanma hareketi (aşağı sürükleme)
      let newTranslate = (diff / window.innerHeight) * 100;
      if (newTranslate > 100) newTranslate = 100;
      setTranslateY(newTranslate);
    }
  };

  // Sürükleme bittiğinde menüyü aç/kapat
  const finishMove = () => {
    setAnimating(true);
    if (!isOpen) {
      if (translateY < 50) {
        setIsOpen(true);
        setTranslateY(0);
      } else {
        setTranslateY(100);
      }
    } else {
      if (translateY > 50) {
        setIsOpen(false);
        setTranslateY(100);
      } else {
        setTranslateY(0);
      }
    }
  };

  return (
    <>
      {/* Alt tutma alanı - sadece kapalıyken görünür */}
      {!isOpen && (
        <div
          className={styles.handleArea}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onDoubleClick={() => {
            setIsOpen(true);
            setTranslateY(0);
            setAnimating(true);
          }}
        >
          <div className={styles.handleBar}></div>
        </div>
      )}

      {/* Bottom nav */}
      <div
        className={styles.bottomNavContainer}
        style={{
          transform: `translateY(${translateY}%)`,
          transition: animating ? "transform 0.3s ease" : "none",
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
      >
        <div className={styles.handleBarTop}></div>
        <BottomNav />
      </div>
    </>
  );
};

export default BottomSwipeNav;
