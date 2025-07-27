import React, { useState } from "react";
import styles from "./FollowersFollowingPage.module.css";
import UserCard from "./UserCard/UserCard";

const sampleUsers = [
  { id: 1, name: "john_doe", bio: "Web Developer", following: true },
  { id: 2, name: "jane_smith", bio: "Photographer", following: false },
  { id: 3, name: "alex99", bio: "UI/UX Designer", following: true },
];

const FollowersFollowingPage = (type) => {
  const [users, setUsers] = useState(sampleUsers);

  const toggleFollow = (id) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id ? { ...user, following: !user.following } : user
      )
    );
  };

  const removeFollower = (id) => {
    setUsers((prev) => prev.filter((user) => user.id !== id));
  };

  const title = type === "followers" ? "Takipçilerim" : "Takip Ettiklerim";

  return (
     <div className={styles.container}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.list}>
        {users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            onToggleFollow={() => toggleFollow(user.id)}
            onRemove={() => removeFollower(user.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default FollowersFollowingPage;
