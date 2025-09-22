import React from "react";
import UserCardStyle from "./UserCard.module.css";
import { Link } from "react-router-dom";
import {
  FaUserTimes,
  FaUserPlus,
  FaCheck,
  FaHourglassHalf
} from "react-icons/fa";

const UserCard = ({ user, followStatus, onFollow, onRemove }) => {
  // Takip durumuna göre farklı butonlar gösteren yardımcı fonksiyon
  const renderActionButton = () => {
    switch (followStatus) {
      case "following":
        return (
          <button
            className={`${UserCardStyle.action_button} ${UserCardStyle.following_button}`}
            onClick={() => onRemove(user.uid)}
          >
            <FaCheck />
            <span>Takip Ediliyor</span>
          </button>
        );
      case "pending":
        return (
          <button
            className={`${UserCardStyle.action_button} ${UserCardStyle.pending_button}`}
            onClick={() => onFollow(user.uid)}
          >
            <FaHourglassHalf />
            <span>İstek Gönderildi</span>
          </button>
        );
      case "none":
        return (
          <button
            className={`${UserCardStyle.action_button} ${UserCardStyle.follow_button}`}
            onClick={() => onFollow(user.uid)}
          >
            <FaUserPlus />
            <span>Takip Et</span>
          </button>
        );
      case "removeFollower":
        return (
          <button
            className={`${UserCardStyle.action_button} ${UserCardStyle.remove_button}`}
            onClick={() => onRemove(user.uid)}
          >
            <FaUserTimes />
            <span>Kaldır</span>
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className={UserCardStyle.user_card}>
      <Link to={`/profile/${user.username}`} className={UserCardStyle.user_card_link}>
        <img
          src={user.photoURL || "/default-profile.png"}
          alt={`${user.username} avatar`}
          className={UserCardStyle.user_avatar}
        />
        <div className={UserCardStyle.user_info}>
          <span className={UserCardStyle.username}>{user.username}</span>
          <p className={UserCardStyle.bio}>{user.bio || "Henüz bir biyografi eklenmedi."}</p>
        </div>
      </Link>
      {renderActionButton()}
    </div>
  );
};

export default UserCard;