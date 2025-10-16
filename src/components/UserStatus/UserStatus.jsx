// src/components/UserStatus.jsx
import React, { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase-client";

export default function UserStatus({ userId }) {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!userId) return;
    const userRef = doc(db, "users", userId);
    const unsub = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setStatus(docSnap.data().status || "offline");
      } else {
        setStatus("offline");
      }
    });
    return () => unsub();
  }, [userId]);

  const getStatusColor = () => {
    switch (status) {
      case "online":
        return "🟢";
      case "away":
        return "🟡";
      case "offline":
      default:
        return "🔴";
    }
  };

  return <span>{getStatusColor()} {status}</span>;
}
