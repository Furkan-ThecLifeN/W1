// src/components/ActiveUsersBar/ActiveUsersBar.jsx
import React, { useRef, useState, useEffect } from "react";
import styles from "./ActiveUsersBar.module.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useUser } from "../../context/UserContext";
import { db } from "../../config/firebase-client";
// ✅ Sadece kendi durumumuzu dinlemek için 'doc' ve 'onUserSnapshot' kaldı.
import { doc, onSnapshot as onUserSnapshot } from "firebase/firestore";

// ✅ 1. 'users' prop'unu al. Varsayılan olarak boş bir dizi ata.
const ActiveUsersBar = ({ users = [] }) => {
  const { currentUser } = useUser();
  const scrollRef = useRef(null);
  const [myStatus, setMyStatus] = useState("online");

  // ✅ 2. BÜYÜK DEĞİŞİKLİK:
  // 'activeUsers' state'i ve tüm kullanıcıları dinleyen useEffect kaldırıldı.
  // Bileşen artık 'users' prop'una bağımlı.

  // 🔹 Sadece kendi durumunu dinle (Bu kısım aynı kalır)
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

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = 250;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // ✅ 3. Filtreleme mantığı 'activeUsers' state'i yerine 'users' prop'unu kullanır.
  // 'followingUsers' listesi zaten 'currentUser'ı içermediği için UID kontrolüne gerek yok.
  const otherUsers = users.filter(
    (u) => u.status !== "invisible"
  );

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
        {/* 🔹 Kendi profili - status daima güncel */}
        {currentUser && (
          <div className={`${styles.userCard} ${styles.myProfileCard}`}>
            <div className={styles.profileWrapper}>
              <img
                src={currentUser.photoURL || "/default-profile.png"}
                alt={currentUser.displayName || "Sen"}
              />
              <span
                className={`${styles.statusDot} ${
                  myStatus === "online"
                    ? styles.online
                    : myStatus === "dnd"
                    ? styles.dnd
                    : myStatus === "away"
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

        {/* ✅ 4. Diğer kullanıcılar (Artık prop'tan gelen 'followingUsers' listesi) */}
        {otherUsers.map((user) => (
          <div key={user.uid} className={styles.userCard}>
            <div className={styles.profileWrapper}>
              <img src={user.photoURL} alt={user.displayName} />
              <span
                className={`${styles.statusDot} ${
                  user.status === "online"
                    ? styles.online
                    : user.status === "dnd"
                    ? styles.dnd
                    : user.status === "away"
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