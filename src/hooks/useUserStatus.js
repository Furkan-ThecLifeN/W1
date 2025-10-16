// src/hooks/useUserStatus.js
import { useEffect, useRef } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../config/firebase-client";

export function useUserStatus() {
  const statusRef = useRef(null);
  const timeoutRef = useRef(null);
  const lastActionRef = useRef(Date.now());

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);

    const updateStatus = async (newStatus) => {
      if (statusRef.current === newStatus) return; // aynı statü yazılmasın
      statusRef.current = newStatus;
      try {
        await setDoc(
          userRef,
          {
            status: newStatus,
            lastActive: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (err) {
        console.error("Durum güncellenirken hata:", err);
      }
    };

    // Kullanıcı siteye girince hemen "online"
    updateStatus("online");

    // 5 dk sonra hala gelmezse offline yap
    const scheduleOffline = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        const idleTime = Date.now() - lastActionRef.current;
        if (idleTime >= 5 * 60 * 1000) {
          updateStatus("offline");
        }
      }, 5 * 60 * 1000);
    };

    // Kullanıcı geri gelirse timer iptal edilir
    const resetToOnline = () => {
      lastActionRef.current = Date.now();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      updateStatus("online");
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        lastActionRef.current = Date.now();
        scheduleOffline(); // 5 dk bekle
      } else {
        resetToOnline(); // geri döndü
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("mousemove", resetToOnline);
    window.addEventListener("keydown", resetToOnline);

    const handleBeforeUnload = () => updateStatus("offline");
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("mousemove", resetToOnline);
      window.removeEventListener("keydown", resetToOnline);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);
}
