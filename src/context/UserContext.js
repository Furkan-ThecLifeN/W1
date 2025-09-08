import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useMemo,
} from "react";
import { auth, db } from "../config/firebase-client";
import { useAuth } from "./AuthProvider";
import { collection, getDocs } from "firebase/firestore";

const UserContext = createContext();

const defaultUser = {
  uid: null,
  username: "",
  displayName: "",
  email: "",
  bio: "",
  photoURL:
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
  familySystem: null,
  accountType: "personal",
  stats: {
    posts: 0,
    rta: 0,
    followers: 0,
    following: 0,
  },
  privacySettings: {
    messages: "everyone",
    storyReplies: true,
    hideLikes: false,
  },
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser hook'u UserProvider içerisinde kullanılmalıdır.");
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useAuth();

  // ✅ Yeni fonksiyon: Kullanıcının toplam gönderi sayısını al
  const getCombinedPostCount = async (uid) => {
    try {
      if (!uid) return 0;

      const postsRef = collection(db, "users", uid, "posts");
      const feedsRef = collection(db, "users", uid, "feeds");
      const feelingsRef = collection(db, "users", uid, "feelings");

      const [postsSnap, feedsSnap, feelingsSnap] = await Promise.all([
        getDocs(postsRef),
        getDocs(feedsRef),
        getDocs(feelingsRef),
      ]);

      return postsSnap.size + feedsSnap.size + feelingsSnap.size;
    } catch (error) {
      console.error("Gönderi sayısını alırken hata oluştu:", error);
      return 0;
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          const res = await fetch(
            `${process.env.REACT_APP_API_URL}/api/auth/profile`,
            {
              headers: {
                Authorization: `Bearer ${idToken}`,
              },
            }
          );

          if (res.ok) {
            const { profile } = await res.json();
            const totalPosts = await getCombinedPostCount(firebaseUser.uid);

            setCurrentUser({
              ...defaultUser,
              ...profile,
              stats: {
                ...defaultUser.stats,
                ...(profile.stats || {}),
                posts: totalPosts,
              },
              privacySettings: {
                ...defaultUser.privacySettings,
                ...(profile.privacySettings || {}),
              },
            });
          } else {
            console.error("Kullanıcı profili alınamadı.");
            setCurrentUser(null);
          }
        } catch (error) {
          console.error("Kullanıcı profili alınırken hata:", error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updatePrivacySettings = async (settings) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/users/privacy/${settings.type}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(settings.data),
        }
      );

      if (!response.ok) {
        throw new Error("Gizlilik ayarları güncellenirken hata oluştu.");
      }

      setCurrentUser((prevUser) => ({
        ...prevUser,
        privacySettings: {
          ...prevUser.privacySettings,
          ...settings.data,
        },
      }));

      return true;
    } catch (error) {
      console.error("Gizlilik ayarlarını güncelleme hatası:", error);
      showToast("error", "Gizlilik ayarları güncellenirken hata oluştu.");
      return false;
    }
  };

  const updateHideLikes = async (value) => {
    try {
      if (!auth.currentUser) throw new Error("Kullanıcı kimliği doğrulanmadı.");

      const token = await auth.currentUser.getIdToken();
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/users/settings/hide-likes`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ hideLikes: value }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ayarlar güncellenemedi.");
      }

      const { profile } = await response.json();

      setCurrentUser((prev) => ({
        ...prev,
        ...profile,
        privacySettings: {
          ...prev.privacySettings,
          hideLikes: value,
        },
      }));

      showToast("success", "Beğenileri gizleme ayarı güncellendi!");
      return true;
    } catch (error) {
      console.error("Beğenileri gizleme ayarı güncelleme hatası:", error);
      showToast(
        "error",
        error.message || "Ayarlar güncellenirken bir hata oluştu."
      );
      return false;
    }
  };

  const saveLoginDevice = async (deviceInfo) => {
    try {
      const idToken = await auth.currentUser.getIdToken();
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/users/devices/save`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify(deviceInfo),
        }
      );

      if (!res.ok) {
        throw new Error("Cihaz bilgileri kaydedilemedi.");
      }
      const data = await res.json();
      console.log("Cihaz bilgileri kaydedildi:", data);
    } catch (error) {
      console.error("Cihaz bilgisi kaydetme hatası:", error);
      showToast("error", "Giriş cihazı kaydedilirken hata oluştu.");
    }
  };

  const contextValue = useMemo(
    () => ({
      currentUser,
      setCurrentUser,
      loading,
      defaultUser,
      updatePrivacySettings,
      updateHideLikes,
      saveLoginDevice,
    }),
    [currentUser, loading]
  );

  return (
    <UserContext.Provider value={contextValue}>
      {!loading && children}
    </UserContext.Provider>
  );
};
