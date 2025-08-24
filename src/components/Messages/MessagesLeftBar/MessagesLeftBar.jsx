// src/components/MessagesLeftBar/MessagesLeftBar.jsx
import React, { useState, useEffect } from "react";
import styles from "./MessagesLeftBar.module.css";
import { IoSearchSharp } from "react-icons/io5";
import { FaMicrophone } from "react-icons/fa";
import { useUser } from "../../../context/UserContext";
import { useAuth } from "../../../context/AuthProvider";
import LoadingOverlay from "../../LoadingOverlay/LoadingOverlay"; // Yolu projene göre düzenle

const MessagesLeftBar = ({ onSelectUser }) => {
  const { currentUser } = useUser();
  const { currentUser: firebaseUser } = useAuth();
  const [followingUsers, setFollowingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFollowing = async () => {
      if (!currentUser?.uid || !firebaseUser) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const idToken = await firebaseUser.getIdToken();
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/users/${currentUser.uid}/following`,
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error("Takip edilenler listesi alınamadı.");
        }
        const data = await response.json();
        setFollowingUsers(data.following);
      } catch (err) {
        console.error("Takip edilenleri çekme hatası:", err);
        setError("Takip edilenler listesi yüklenemedi.");
      } finally {
        setLoading(false);
      }
    };
    fetchFollowing();
  }, [currentUser?.uid, firebaseUser]);

  return (
    <div className={styles.MessagesLeftBar}>
      {loading && <LoadingOverlay />}

      <div className={styles.left_SearchInputBox}>
        <IoSearchSharp className={styles.searchInputIcon} />
        <input type="text" placeholder="Search messages..." />
        <FaMicrophone className={styles.searchInputIcon} />
      </div>

      <ul className={styles.usersMessagesBox}>
        {error ? (
          <li className={styles.statusMessage}>{error}</li>
        ) : followingUsers.length > 0 ? (
          followingUsers.map((user) => (
            <li
              key={user.uid}
              className={styles.userCard}
              onClick={() => onSelectUser(user)} // 🔹 kullanıcı seçimi buradan MessagesPage'e gönderiliyor
            >
              <div className={styles.userProfileBox}>
                <div className={styles.userProfileBackground}>
                  <img
                    src={user.photoURL}
                    alt={user.displayName || user.username}
                  />
                </div>
              </div>
              <div className={styles.userMessageInfo}>
                <p className={styles.userName}>
                  {user.displayName || user.username}
                </p>
                <p className={styles.lastMessage}>@{user.username}</p>
              </div>
            </li>
          ))
        ) : (
          !loading && (
            <li className={styles.statusMessage}>
              Henüz takip ettiğiniz kimse yok.
            </li>
          )
        )}
      </ul>
    </div>
  );
};

export default MessagesLeftBar;
