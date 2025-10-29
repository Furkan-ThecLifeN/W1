// FollowButton.jsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthProvider";
import styles from "./FollowButton.module.css";

const apiBaseUrl = process.env.REACT_APP_API_URL;

const FollowButton = ({
  targetUid,
  isTargetPrivate,
  initialFollowStatus,
  onFollowStatusChange,
  stats, // Bu eklenmeli, giriş yapmayanlar için sayıyı göstereceğiz
}) => {
  const { currentUser, showToast } = useAuth();
  const [followStatus, setFollowStatus] = useState(
    initialFollowStatus || "none"
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFollowStatus(initialFollowStatus || "none");
  }, [initialFollowStatus]);

  // Eğer giriş yoksa backend’e request atma, sadece initial stat göster
  useEffect(() => {
    if (!currentUser || !targetUid) return;
    const fetchFollowStatus = async () => {
      try {
        const idToken = await currentUser.getIdToken();
        const res = await axios.get(
          `${apiBaseUrl}/api/users/profile/${targetUid}/status`,
          { headers: { Authorization: `Bearer ${idToken}` } }
        );
        setFollowStatus(res.data.followStatus || "none");
        onFollowStatusChange?.(res.data.followStatus, res.data.stats);
      } catch (err) {
        console.error("FollowButton: Durum fetch hatası ->", err);
      }
    };
    fetchFollowStatus();
  }, [currentUser, targetUid, onFollowStatusChange]);

  const handleFollowAction = async () => {
    if (!currentUser) {
      showToast("Takip etmek için giriş yapın!", "error");
      return;
    }
    if (isLoading) return;
    setIsLoading(true);
    const previousStatus = followStatus;

    try {
      let endpoint = "";
      let method = "";
      let data = { targetUid };
      let optimisticStatus = previousStatus;

      if (previousStatus === "none") {
        endpoint = `${apiBaseUrl}/api/users/follow`;
        method = "POST";
        optimisticStatus = isTargetPrivate ? "pending" : "following";
      } else if (previousStatus === "pending") {
        endpoint = `${apiBaseUrl}/api/users/follow/request/retract/${targetUid}`;
        method = "DELETE";
        data = {};
        optimisticStatus = "none";
      } else if (previousStatus === "following") {
        endpoint = `${apiBaseUrl}/api/users/unfollow/${targetUid}`;
        method = "DELETE";
        data = {};
        optimisticStatus = "none";
      }

      setFollowStatus(optimisticStatus);

      const idToken = await currentUser.getIdToken();
      const res = await axios({
        method,
        url: endpoint,
        headers: { Authorization: `Bearer ${idToken}` },
        data,
      });
      setFollowStatus(res.data.status || "none");
      onFollowStatusChange?.(res.data.status, res.data.newStats);
      showToast(res.data.message, "success");
    } catch (err) {
      console.error("Follow action error:", err);
      setFollowStatus(previousStatus);
      showToast(
        err.response?.data?.error || "Takip işlemi başarısız.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderButton = () => {
    if (!currentUser) {
      // Giriş yapmamış kullanıcılar için buton göster, tıklayınca uyarı
      return (
        <button
          onClick={() => showToast("Takip etmek için giriş yapın!", "error")}
          className={`${styles.followBtn} ${styles.actionButton}`}
        >
          Follow
        </button>
      );
    }

    switch (followStatus) {
      case "following":
        return (
          <button
            onClick={handleFollowAction}
            className={`${styles.unfollowBtn} ${styles.actionButton}`}
            disabled={isLoading}
          >
            Unfollow
          </button>
        );
      case "pending":
        return (
          <button
            onClick={handleFollowAction}
            className={`${styles.pendingBtn} ${styles.actionButton}`}
            disabled={isLoading}
          >
            İstek Gönderildi
          </button>
        );
      case "none":
      default:
        return (
          <button
            onClick={handleFollowAction}
            className={`${styles.followBtn} ${styles.actionButton}`}
            disabled={isLoading}
          >
            Follow
          </button>
        );
    }
  };

  return <>{renderButton()}</>;
};

export default FollowButton;
