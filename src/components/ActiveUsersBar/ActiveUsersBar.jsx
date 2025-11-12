// src/components/ActiveUsersBar/ActiveUsersBar.jsx
import React, { useRef, useState, useEffect } from "react";
import styles from "./ActiveUsersBar.module.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useUser } from "../../context/UserContext";
import { db } from "../../config/firebase-client";
import { doc, onSnapshot as onUserSnapshot, updateDoc, serverTimestamp } from "firebase/firestore";

const ActiveUsersBar = ({ users = [] }) => {
  const { currentUser } = useUser();
  const scrollRef = useRef(null);
  const [myStatus, setMyStatus] = useState("online");

  // ---------------------------------------------------
  // Kullanıcının kendi durumunu ve lastActive bilgisini dinleme
  // ---------------------------------------------------
  useEffect(() => {
    if (!currentUser?.uid) return;
    const userRef = doc(db, "users", currentUser.uid);
    const unsub = onUserSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMyStatus(data.status || "offline");
      }
    });
    return () => unsub();
  }, [currentUser]);

  // ---------------------------------------------------
  // Kullanıcı aktifliğini güncelleme (mouse, scroll, keypress)
  // ---------------------------------------------------
  useEffect(() => {
    if (!currentUser?.uid) return;

    const updateLastActive = async () => {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        lastActive: serverTimestamp(),
      });
    };

    // Sayfa açıldığında güncelle
    updateLastActive();

    // Etkinlikler
    const events = ["mousemove", "keydown", "scroll", "click"];
    const handler = () => updateLastActive();

    events.forEach((e) => window.addEventListener(e, handler));

    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
    };
  }, [currentUser]);

  // ---------------------------------------------------
  // Scroll butonları
  // ---------------------------------------------------
  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = 250;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // ---------------------------------------------------
  // Kullanıcının aktif mi, away mı olduğunu hesaplama (7 dk)
  // ---------------------------------------------------
  const getStatus = (user) => {
    if (!user.lastActive) return "offline";
    const last = user.lastActive.toDate?.() || user.lastActive;
    const diff = (new Date() - new Date(last)) / 1000; // saniye
    if (diff > 420) return "away"; // 7 dakika = 420 saniye
    return user.status || "offline";
  };

  // Diğer kullanıcılar (invisible değil)
  const otherUsers = users.filter((u) => u.status !== "invisible");

  return (
    <div className={styles.activeUsersContainer}>
      <div className={styles.header}>
        <h3 className={styles.title}>Active Users</h3>
        <div className={styles.navButtons}>
          <button onClick={() => scroll("left")} className={styles.navButton}>
            <FaChevronLeft />
          </button>
          <button onClick={() => scroll("right")} className={styles.navButton}>
            <FaChevronRight />
          </button>
        </div>
      </div>

      <div className={styles.usersScroll} ref={scrollRef}>
        {/* Kendi profili */}
        {currentUser && (
          <div className={`${styles.userCard} ${styles.myProfileCard}`}>
            <div className={styles.profileWrapper}>
              <img
                src={currentUser.photoURL || "/default-profile.png"}
                alt={currentUser.displayName || "Sen"}
              />
              <span
                className={`${styles.statusDot} ${
                  getStatus({ lastActive: new Date(), status: myStatus }) === "online"
                    ? styles.online
                    : getStatus({ lastActive: new Date(), status: myStatus }) === "dnd"
                    ? styles.dnd
                    : getStatus({ lastActive: new Date(), status: myStatus }) === "away"
                    ? styles.away
                    : styles.offline
                }`}
              ></span>
            </div>
            <p className={styles.username}>
              {currentUser.displayName || "Sen"}
            </p>
          </div>
        )}

        {/* Diğer kullanıcılar */}
        {otherUsers.map((user) => (
          <div key={user.uid} className={styles.userCard}>
            <div className={styles.profileWrapper}>
              <img src={user.photoURL} alt={user.displayName} />
              <span
                className={`${styles.statusDot} ${
                  getStatus(user) === "online"
                    ? styles.online
                    : getStatus(user) === "dnd"
                    ? styles.dnd
                    : getStatus(user) === "away"
                    ? styles.away
                    : styles.offline
                }`}
              ></span>
            </div>
            <p className={styles.username}>{user.displayName}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveUsersBar;
