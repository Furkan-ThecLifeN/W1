import React from "react";
import UserCardStyle from "./UserCard.module.css";
import { Link } from "react-router-dom";

const UserCard = ({ user }) => {
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
          <p className={UserCardStyle.bio}>{user.bio}</p>
        </div>
      </Link>
    </div>
  );
};

export default UserCard;
