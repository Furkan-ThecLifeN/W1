import React, { useEffect } from "react";
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
import { useMessagesStore } from "../../../Store/useMessagesStore";

const MessagesLeftBar = ({ onSelectUser }) => {
  const { currentUser } = useUser();
  const { currentUser: firebaseUser } = useAuth();
  const { users, loadingUsers, errorUsers, setUsers, setLoading, setError } =
    useMessagesStore();

  useEffect(() => {
    // Eğer kullanıcılar zaten store'da yüklüyse tekrar çekme! (Caching)
    if (!currentUser?.uid || (users.length > 0 && !loadingUsers)) return;

    const API_URL = process.env.REACT_APP_API_URL;
    if (!API_URL) return setError("API adresi yapılandırılmamış.");

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const db = getFirestore(getApp());

        // 1. Backend takip edilen kullanıcıları getir (Burası HTTP, Firestore Read yazmaz)
        const res = await fetch(
          `${API_URL}/api/users/${currentUser.uid}/following`,
          {
            headers: { Authorization: `Bearer ${firebaseUser?.accessToken}` },
          }
        );
        const followingList = res.ok ? (await res.json()).following || [] : [];

        // 2. Firebase Konuşmalarını Getir
        const conversationsRef = collection(db, "conversations");
        const q = query(
          conversationsRef,
          where("members", "array-contains", currentUser.uid)
        );
        const snapshot = await getDocs(q);

        // OPTİMİZASYON BURADA:
        const messageUsers = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            const otherUserId = data.members.find((m) => m !== currentUser.uid);
            if (!otherUserId) return null;

            let userData = null;

            // A) Verimlilik: Eğer conversation içinde 'membersInfo' varsa oradan al (0 READ)
            if (data.membersInfo && data.membersInfo[otherUserId]) {
              userData = {
                ...data.membersInfo[otherUserId],
                username: data.membersInfo[otherUserId].displayName, // Fallback
              };
            }

            // B) Eğer yoksa mecburen Firestore'dan çek (1 READ - Eskisi gibi)
            // Zamanla yeni mesajlar geldikçe herkes A şıkkına dönecek.
            if (!userData) {
              const userDoc = await getDoc(doc(db, "users", otherUserId));
              if (userDoc.exists()) {
                userData = userDoc.data();
              }
            }

            if (!userData) return null;

            return {
              uid: otherUserId,
              conversationId: docSnap.id,
              lastMessage: data.lastMessage || null,
              displayName:
                userData.displayName || userData.username || otherUserId,
              username: userData.username || otherUserId,
              photoURL: userData.photoURL || "/default-profile.png",
              status: userData.status || "offline",
            };
          })
        );

        const validUsers = [...followingList, ...messageUsers.filter(Boolean)];
        const uniqueUsers = Array.from(
          new Map(validUsers.map((u) => [u.uid, u])).values()
        );

        uniqueUsers.sort(
          (a, b) =>
            (b.lastMessage?.updatedAt?.seconds || 0) -
            (a.lastMessage?.updatedAt?.seconds || 0)
        );

        setUsers(uniqueUsers);
      } catch (err) {
        console.error(err);
        setError("Kullanıcılar yüklenemedi.");
      }
    };

    fetchUsers();
  }, [currentUser?.uid, firebaseUser, setUsers, setLoading, setError]); // users.length dependency'den kaldırıldı, manuel kontrol var

  return (
    <div className={styles.MessagesLeftBar}>
      {loadingUsers && <LoadingOverlay />}

      <div className={styles.left_SearchInputBox}>
        <IoSearchSharp className={styles.searchInputIcon} />
        <input type="text" placeholder="Search messages..." />
        <FaMicrophone className={styles.searchInputIcon} />
      </div>

      <ul className={styles.usersMessagesBox}>
        {errorUsers ? (
          <li className={styles.statusMessage}>{errorUsers}</li>
        ) : users.length > 0 ? (
          users.map((user) => (
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
                  />
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
          !loadingUsers && (
            <li className={styles.statusMessage}>Henüz konuşmanız yok.</li>
          )
        )}
      </ul>
    </div>
  );
};

export default MessagesLeftBar;
