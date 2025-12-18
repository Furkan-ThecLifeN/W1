import { create } from "zustand";
import { db, auth } from "../config/firebase-client"; 
import { doc, getDoc } from "firebase/firestore";

export const useUserStore = create((set, get) => ({
  currentUser: null,
  isLoading: false,
  isLoaded: false,
  error: null,

  // ✅ YENİ: Başka kullanıcıların verilerini burada saklayacağız (Cache)
  // Yapı: { "uid_123": { displayName: "Ahmet", photoURL: "..." } }
  usersCache: {},

  // Mevcut kullanıcını getir (Eski kodun aynısı)
  fetchCurrentUser: async () => {
    if (get().isLoaded && get().currentUser) return;
    set({ isLoading: true, error: null });
    try {
      const authUser = auth.currentUser;
      if (!authUser) return;
      const userDocRef = doc(db, "users", authUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        set({ 
          currentUser: {
            uid: authUser.uid,
            displayName: userData.displayName || "Kullanıcı",
            username: userData.username || "",
            photoURL: userData.photoURL || null,
            status: userData.status || "online"
          }, 
          isLoaded: true, 
          isLoading: false 
        });
      }
    } catch (error) {
      console.error("Profil hatası:", error);
      set({ error: error.message, isLoading: false });
    }
  },

  // ✅ YENİ FONKSİYON: ID'si verilen kullanıcının verisini getir (Cache varsa oradan, yoksa Firebase'den)
  getUserProfile: async (uid) => {
    // 1. Önce Cache'e bak
    const cache = get().usersCache;
    if (cache[uid]) {
      return cache[uid]; // Veri zaten bizde var, Firebase'e gitme!
    }

    // 2. Cache'de yoksa Firebase'den çek
    try {
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const profile = {
          uid,
          displayName: userData.displayName || "Anonim",
          photoURL: userData.photoURL || null
        };

        // 3. Veriyi Cache'e kaydet
        set((state) => ({
          usersCache: { ...state.usersCache, [uid]: profile }
        }));
        
        return profile;
      }
    } catch (err) {
      console.error("Kullanıcı veri hatası:", err);
    }
    return null;
  },

  reset: () => set({ currentUser: null, isLoaded: false, isLoading: false, usersCache: {} })
}));