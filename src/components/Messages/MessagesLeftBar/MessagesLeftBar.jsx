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
import ActiveUsersBar from "../../ActiveUsersBar/ActiveUsersBar";
import { useMessagesStore } from "../../../Store/useMessagesStore";

const MessagesLeftBar = ({ onSelectUser }) => {
  const { currentUser } = useUser();
  const { currentUser: firebaseUser } = useAuth();
  const { users, loadingUsers, errorUsers, setState } = useMessagesStore();

  useEffect(() => {
    if (!currentUser?.uid || users.length > 0) return; // ✅ Eğer kullanıcılar zaten yüklüyse tekrar fetch etme

    // Ortam değişkeninden API adresini al
    // Vercel'de bu 'https://w1b.onrender.com' olacak
    const API_URL = process.env.REACT_APP_API_URL;

    const fetchAllData = async () => {
      setState({ loadingUsers: true, errorUsers: null });

      if (!API_URL) {
        console.error(
          "REACT_APP_API_URL bulunamadı. Lütfen .env dosyanızı veya Vercel ayarlarınızı kontrol edin."
        );
        setState({
          errorUsers: "API adresi yapılandırılmamış.",
          loadingUsers: false,
        });
        return;
      }

      try {
        const db = getFirestore(getApp());

        // 1️⃣ Backend'den takip edilen kullanıcılar
        // API_URL değişkeni burada kullanıldı
        const res = await fetch(
          `${API_URL}/api/users/${currentUser.uid}/following`,
          {
            headers: { Authorization: `Bearer ${firebaseUser?.accessToken}` },
          }
        );

        // Hata kontrolü eklendi
        if (!res.ok) {
          throw new Error(`API isteği başarısız oldu: ${res.status}`);
        }

        const data = await res.json();
        const followingList = Array.isArray(data.following)
          ? data.following
          : [];

        // 2️⃣ Firebase’den mesajlaşılmış kullanıcılar
        const conversationsRef = collection(db, "conversations");
        const q = query(
          conversationsRef,
          where("members", "array-contains", currentUser.uid)
        );
        const snapshot = await getDocs(q);

        const messageUsers = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            const otherUserId = data.members.find((m) => m !== currentUser.uid);
            // Hata durumunda (otherUserId yoksa) devam etmeyi engelle
            if (!otherUserId) return null;

            const userDoc = await getDoc(doc(db, "users", otherUserId));
            const userData = userDoc.exists() ? userDoc.data() : {};
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

        // null olanları filtrele (yukarıdaki if (!otherUserId) kontrolü için)
        const validMessageUsers = messageUsers.filter((user) => user !== null);

        // 3️⃣ Takip edilenler + mesajlaşılmış kişiler birleşir ve UID bazlı tekilleşir
        const merged = [...followingList, ...validMessageUsers];
        const uniqueMerged = Array.from(
          new Map(merged.map((u) => [u.uid, u])).values()
        );

        // 4️⃣ Son mesaj zamanına göre sırala
        uniqueMerged.sort(
          (a, b) =>
            (b.lastMessage?.updatedAt?.seconds || 0) -
            (a.lastMessage?.updatedAt?.seconds || 0)
        );

        setState({ users: uniqueMerged, loadingUsers: false });
      } catch (err) {
        console.error("Veri yükleme hatası:", err);
        setState({
          errorUsers: "Kullanıcılar yüklenemedi.",
          loadingUsers: false,
        });
      }
    };

    fetchAllData();
  }, [currentUser?.uid, firebaseUser, users.length, setState]);

  return (
    <div className={styles.MessagesLeftBar}>
      <ActiveUsersBar users={users} />

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
          !loadingUsers && (
            <li className={styles.statusMessage}>Henüz konuşmanız yok.</li>
          )
        )}
      </ul>
    </div>
  );
};

export default MessagesLeftBar;
