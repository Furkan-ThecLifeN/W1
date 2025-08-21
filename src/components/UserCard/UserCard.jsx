import React from "react";
import UserCardStyle from "./UserCard.module.css";
import { Link } from "react-router-dom";

const UserCard = ({ user }) => {
  return (
    <Link to={`/profile/${user.username}`} className={UserCardStyle.user_card_link}>
      <li className={UserCardStyle.user_card}>
        <img
          src={user.photoURL}
          alt={`${user.username} avatar`}
          className={UserCardStyle.user_avatar}
        />
        <div className={UserCardStyle.user_info}>
          <span className={UserCardStyle.username}>{user.username}</span>
          <p className={UserCardStyle.bio}>{user.bio}</p>
        </div>
      </li>
    </Link>
  );
};

export default UserCard;