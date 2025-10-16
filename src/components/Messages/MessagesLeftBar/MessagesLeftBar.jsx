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
  const [followingUsers, setFollowingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!currentUser?.uid || !firebaseUser) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const db = getFirestore(getApp());
        const conversationsRef = collection(db, "conversations");
        const q = query(
          conversationsRef,
          where("members", "array-contains", currentUser.uid)
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          setFollowingUsers([]);
          setLoading(false);
          return;
        }

        const conversations = await Promise.all(
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
              status: userData.status || "offline", // ✅ Status eklendi
            };
          })
        );

        conversations.sort((a, b) => {
          const aTime = a.lastMessage?.updatedAt?.seconds || 0;
          const bTime = b.lastMessage?.updatedAt?.seconds || 0;
          return bTime - aTime;
        });

        setFollowingUsers(conversations);
      } catch (err) {
        console.error("Konuşmaları çekme hatası:", err);
        setError("Konuşmalar yüklenemedi.");
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [currentUser?.uid, firebaseUser]);

  return (
    <div className={styles.MessagesLeftBar}>
      <ActiveUsersBar users={followingUsers} /> {/* ✅ Status ile gelen ActiveUsers */}
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
            <li className={styles.statusMessage}>
              Henüz konuşmanız bulunmamaktadır.
            </li>
          )
        )}
      </ul>
    </div>
  );
};

export default MessagesLeftBar;
