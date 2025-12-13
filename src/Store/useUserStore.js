import { create } from "zustand";
import { db, auth } from "../config/firebase-client"; 
import { doc, getDoc } from "firebase/firestore";

export const useUserStore = create((set, get) => ({
  currentUser: null, // Kullanıcı profili (displayName, photoURL, vs.)
  isLoading: false,
  isLoaded: false, // Daha önce çekildi mi?
  error: null,

  // ✅ Kullanıcı Profilini Getir (Sadece 1 kez çalışır)
  fetchCurrentUser: async () => {
    // 1. Eğer veri zaten varsa ve kullanıcı değişmediyse tekrar çekme
    if (get().isLoaded && get().currentUser) return;

    set({ isLoading: true, error: null });

    try {
      const authUser = auth.currentUser;
      if (!authUser) return;

      // Firestore'dan kullanıcının detaylı profilini çek
      const userDocRef = doc(db, "users", authUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Store'a kaydet
        set({ 
          currentUser: {
            uid: authUser.uid,
            displayName: userData.displayName || "Kullanıcı",
            username: userData.username || "",
            photoURL: userData.photoURL || null,
            status: userData.status || "online" // Varsayılan online
          }, 
          isLoaded: true, 
          isLoading: false 
        });
      }

    } catch (error) {
      console.error("Kullanıcı profili hatası:", error);
      set({ error: error.message, isLoading: false });
    }
  },

  // Logout durumunda store'u temizle
  reset: () => set({ currentUser: null, isLoaded: false, isLoading: false })
}));