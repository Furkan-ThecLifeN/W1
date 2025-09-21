import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthProvider";
import styles from "./FollowButton.module.css";

const apiBaseUrl = process.env.REACT_APP_API_URL;

const FollowButton = ({ targetUid, isTargetPrivate, initialFollowStatus, onFollowStatusChange }) => {
  const { currentUser, showToast } = useAuth();
  const [followStatus, setFollowStatus] = useState("none");
  const [isLoading, setIsLoading] = useState(false);

  // İlk render ve initialFollowStatus değiştiğinde senkronize et
  useEffect(() => {
    setFollowStatus(initialFollowStatus || "none");
  }, [initialFollowStatus]);

  // Sayfa yüklendiğinde backend’den gerçek durumu çek
  useEffect(() => {
    const fetchFollowStatus = async () => {
      if (!currentUser || !targetUid) return;
      try {
        const idToken = await currentUser.getIdToken();
        const res = await axios.get(`${apiBaseUrl}/api/users/profile/${targetUid}/status`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        setFollowStatus(res.data.followStatus || "none");
        if (onFollowStatusChange) onFollowStatusChange(res.data.followStatus, res.data.stats);
      } catch (err) {
        console.error("FollowButton: Durum fetch hatası ->", err);
      }
    };
    fetchFollowStatus();
  }, [currentUser, targetUid, onFollowStatusChange]);

  const handleFollowAction = async () => {
    if (isLoading) return;
    setIsLoading(true);
    const previousStatus = followStatus;

    try {
      // UI’yi hemen değiştir (optimistic)
      const newStatus = previousStatus === "none" ? (isTargetPrivate ? "pending" : "following") : "none";
      setFollowStatus(newStatus);

      const idToken = await currentUser.getIdToken();
      let endpoint = "";
      let method = "POST";
      let data = { targetUid };

      if (previousStatus === "none") {
        endpoint = `${apiBaseUrl}/api/users/follow`;
      } else if (previousStatus === "pending") {
        endpoint = `${apiBaseUrl}/api/users/follow/request/retract`;
        method = "DELETE";
      } else if (previousStatus === "following") {
        endpoint = `${apiBaseUrl}/api/users/unfollow/${targetUid}`;
        method = "DELETE";
        data = {};
      }

      const res = await axios({ method, url: endpoint, headers: { Authorization: `Bearer ${idToken}` }, data });
      setFollowStatus(res.data.status || "none");

      if (onFollowStatusChange) onFollowStatusChange(res.data.status, res.data.newStats);
      showToast(res.data.message, "success");
    } catch (err) {
      console.error("Follow action error:", err);
      setFollowStatus(previousStatus); // revert on error
      showToast(err.response?.data?.error || "Takip işlemi başarısız.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const renderButton = () => {
    switch (followStatus) {
      case "following":
        return (
          <button onClick={handleFollowAction} className={`${styles.unfollowBtn} ${styles.actionButton}`} disabled={isLoading}>
             Unfollow
          </button>
        );
      case "pending":
        return (
          <button onClick={handleFollowAction} className={`${styles.pendingBtn} ${styles.actionButton}`} disabled={isLoading}>
             İstek Gönderildi
          </button>
        );
      case "none":
      default:
        return (
          <button onClick={handleFollowAction} className={`${styles.followBtn} ${styles.actionButton}`} disabled={isLoading}>
         Follow
          </button>
        );
    }
  };

  return <>{renderButton()}</>;
};

export default FollowButton;
