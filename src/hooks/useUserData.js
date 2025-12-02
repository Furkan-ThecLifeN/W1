import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase-client"; // kendi firebase config yolunu yaz

export const useUserData = (uid) => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (!uid) return;

    const ref = doc(db, "users", uid);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setUserData(snap.data());
    });

    return () => unsub();
  }, [uid]);

  return userData;
};
