// src/components/ActiveUsersBar/ActiveUsersBar.jsx
import React, { useRef, useState, useEffect } from "react";
import styles from "./ActiveUsersBar.module.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useUser } from "../../context/UserContext";
import { db } from "../../config/firebase-client";
import { collection, onSnapshot, doc, onSnapshot as onUserSnapshot } from "firebase/firestore";

const ActiveUsersBar = () => {
  const { currentUser } = useUser();
  const scrollRef = useRef(null);
  const [myStatus, setMyStatus] = useState("online");
  const [activeUsers, setActiveUsers] = useState([]);

  // 🔹 Realtime tüm kullanıcıları dinle
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersData = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          uid: docSnap.id,
          displayName: data.displayName || data.username || "Kullanıcı",
          photoURL: data.photoURL || "/default-profile.png",
          status: data.status || "offline",
        };
      });
      setActiveUsers(usersData);
    });
    return () => unsubscribe();
  }, []);

  // 🔹 Sadece kendi durumunu dinle (görünür olması için)
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

  // 🔹 invisible olanları hariç tut
  const otherUsers = activeUsers.filter(
    (u) => u.uid !== currentUser?.uid && u.status !== "invisible"
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

        {/* 🔹 Diğer kullanıcılar */}
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
