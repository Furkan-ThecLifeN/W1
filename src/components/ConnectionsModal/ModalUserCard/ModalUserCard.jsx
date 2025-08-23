import React, { useState, useEffect } from "react";
import styles from "./ModalUserCard.module.css";
import { Link } from "react-router-dom";
import { useUser } from "../../../context/UserContext";

const ModalUserCard = ({ user }) => {
  const { currentUser } = useUser();
  const [followStatus, setFollowStatus] = useState("none");
  const [loading, setLoading] = useState(false);

  // Kullanıcının takip durumunu çek
  useEffect(() => {
    if (!currentUser || !user || currentUser.uid === user.uid) return;

    const fetchFollowStatus = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/users/profile/${user.uid}/status`);
        if (!response.ok) throw new Error("Takip durumu alınamadı");
        const data = await response.json();
        setFollowStatus(data.followStatus);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowStatus();
  }, [currentUser, user]);

  const updateFollowStatus = async (url, method) => {
    setLoading(true);
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: method === "POST" ? JSON.stringify({ targetUid: user.uid }) : undefined,
      });
      if (!response.ok) throw new Error("İşlem başarısız");
      const data = await response.json();
      setFollowStatus(data.status);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = () => updateFollowStatus("/api/users/follow", "POST");
  const handleUnfollow = () => updateFollowStatus(`/api/users/unfollow/${user.uid}`, "DELETE");

  const renderFollowButton = () => {
    if (!currentUser || currentUser.uid === user.uid) return null;

    switch (followStatus) {
      case "following":
        return (
          <button
            className={`${styles.followButton} ${styles.unfollowButton}`}
            onClick={handleUnfollow}
            disabled={loading}
          >
            {loading ? "..." : "Takip Ediliyor"}
          </button>
        );
      case "pending":
        return (
          <button
            className={`${styles.followButton} ${styles.pendingButton}`}
            onClick={handleUnfollow}
            disabled={loading}
          >
            {loading ? "..." : "İstek Gönderildi"}
          </button>
        );
      default:
        return (
          <button
            className={styles.followButton}
            onClick={handleFollow}
            disabled={loading}
          >
            {loading ? "..." : "Takip Et"}
          </button>
        );
    }
  };

  return (
    <div className={styles.cardContainer}>
      <Link to={`/profile/${user.username}`} className={styles.userInfo}>
        <div className={styles.profileImageWrapper}>
          <img
            src={user.photoURL || "/default-profile.png"}
            alt={`${user.displayName}'s profile`}
            className={styles.profileImage}
          />
        </div>
        <div className={styles.textInfo}>
          <span className={styles.username}>{user.username}</span>
          <span className={styles.displayName}>{user.displayName}</span>
        </div>
      </Link>
      {renderFollowButton()}
    </div>
  );
};

export default ModalUserCard;
