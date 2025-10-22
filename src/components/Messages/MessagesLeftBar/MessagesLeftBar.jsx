import React, { useState, useEffect } from "react";
import styles from "./MessagesLeftBar.module.css";
import { IoSearchSharp } from "react-icons/io5";
import { FaMicrophone } from "react-icons/fa";
import { useUser } from "../../../context/UserContext";
import { useAuth } from "../../../context/AuthProvider";
import LoadingOverlay from "../../LoadingOverlay/LoadingOverlay";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { getApp } from "firebase/app";
import ActiveUsersBar from "../../ActiveUsersBar/ActiveUsersBar";

const MessagesLeftBar = ({ onSelectUser }) => {
  const { currentUser } = useUser();
  const { currentUser: firebaseUser } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!currentUser?.uid) return;

      setLoading(true);
      setError(null);

      try {
        const db = getFirestore(getApp());

        // 1️⃣ Backend'den takip edilen kullanıcıları çek
        const res = await fetch(`http://localhost:3001/api/users/${currentUser.uid}/following`, {
          headers: {
            Authorization: `Bearer ${firebaseUser?.accessToken}`,
          },
        });

        const data = await res.json();
        const followingList = Array.isArray(data.following) ? data.following : [];

        // 2️⃣ Firebase'den mesajlaşılmış kullanıcıları çek
        const conversationsRef = collection(db, "conversations");
        const q = query(conversationsRef, where("members", "array-contains", currentUser.uid));
        const snapshot = await getDocs(q);

        const messageUsers = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            const otherUserId = data.members.find((m) => m !== currentUser.uid);
            const userDoc = await getDoc(doc(db, "users", otherUserId));
            const userData = userDoc.exists() ? userDoc.data() : {};
            return {
              uid: otherUserId,
              conversationId: docSnap.id,
              lastMessage: data.lastMessage || null,
              displayName: userData.displayName || userData.username || otherUserId,
              username: userData.username || otherUserId,
              photoURL: userData.photoURL || "/default-profile.png",
              status: userData.status || "offline",
            };
          })
        );

        // 3️⃣ Takip edilenler + mesajlaşılmış kişileri birleştir
        const merged = [...followingList, ...messageUsers];

        // 4️⃣ Aynı kişileri UID bazlı tekilleştir
        const uniqueMerged = Array.from(
          new Map(merged.map((u) => [u.uid, u])).values()
        );

        // 5️⃣ Son mesaj zamanına göre sırala
        uniqueMerged.sort((a, b) => {
          const aTime = a.lastMessage?.updatedAt?.seconds || 0;
          const bTime = b.lastMessage?.updatedAt?.seconds || 0;
          return bTime - aTime;
        });

        setAllUsers(uniqueMerged);
      } catch (err) {
        console.error("Veri yükleme hatası:", err);
        setError("Kullanıcılar yüklenemedi.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [currentUser?.uid, firebaseUser]);

  return (
    <div className={styles.MessagesLeftBar}>
      <ActiveUsersBar users={allUsers} />
      {loading && <LoadingOverlay />}

      <div className={styles.left_SearchInputBox}>
        <IoSearchSharp className={styles.searchInputIcon} />
        <input type="text" placeholder="Search messages..." />
        <FaMicrophone className={styles.searchInputIcon} />
      </div>

      <ul className={styles.usersMessagesBox}>
        {error ? (
          <li className={styles.statusMessage}>{error}</li>
        ) : allUsers.length > 0 ? (
          allUsers.map((user) => (
            <li
              key={user.uid}
              className={styles.userCard}
              onClick={() => onSelectUser(user)}
            >
              <div className={styles.userProfileBox}>
                <div className={styles.userProfileBackground}>
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
              </div>
              <div className={styles.userMessageInfo}>
                <p className={styles.userName}>{user.displayName}</p>
                <p className={styles.lastMessage}>
                  {user.lastMessage?.text || "Yeni mesaj yok"}
                </p>
              </div>
            </li>
          ))
        ) : (
          !loading && (
            <li className={styles.statusMessage}>Henüz konuşmanız yok.</li>
          )
        )}
      </ul>
    </div>
  );
};

export default MessagesLeftBar;
