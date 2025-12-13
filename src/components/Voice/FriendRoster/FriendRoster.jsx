import React, { useState, useRef, useEffect } from "react";
import {
  FaSearch,
  FaUserFriends,
  FaUserSlash,
  FaUserMinus,
  FaUserPlus,
} from "react-icons/fa";
import { RiMore2Fill } from "react-icons/ri";
import styles from "./FriendRoster.module.css";

const mockUsers = [
  {
    id: 1,
    name: "Alex Sterling",
    statusMsg: "Coding the future 🚀",
    status: "online",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
  },
  {
    id: 2,
    name: "Sarah Connor",
    statusMsg: "In a meeting",
    status: "busy",
    avatar: null,
  }, // Avatar yok
  {
    id: 3,
    name: "Mike Ross",
    statusMsg: "AFK - Lunch",
    status: "idle",
    avatar:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100",
  },
  {
    id: 4,
    name: "Jessica Pearson",
    statusMsg: "",
    status: "offline",
    avatar: null,
  }, // Avatar yok
  {
    id: 5,
    name: "Harvey Specter",
    statusMsg: "Winning cases.",
    status: "online",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
  },
];

const FriendRoster = () => {
  const [filter, setFilter] = useState("online");
  const [search, setSearch] = useState("");
  const [activeMenu, setActiveMenu] = useState(null); 
  const menuRef = useRef(null);

  const filteredList = mockUsers.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filter === "online" ? u.status !== "offline" : true;
    return matchSearch && matchStatus;
  });

  // Dışarı tıklayınca menüyü kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Avatar yoksa baş harfi döndür
  const renderAvatar = (user) => {
    if (user.avatar) {
      return <img src={user.avatar} alt={user.name} />;
    }
    return <div className={styles.initialAvatar}>{user.name.charAt(0)}</div>;
  };

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.leftGroup}>
          <div className={styles.headerIconBox}>
            <FaUserFriends />
          </div>
          <h2>Friends</h2>
        </div>

        <div className={styles.rightGroup}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tabButton} ${
                filter === "online" ? styles.activeTab : ""
              }`}
              onClick={() => setFilter("online")}
            >
              Online
            </button>
            <button
              className={`${styles.tabButton} ${
                filter === "all" ? styles.activeTab : ""
              }`}
              onClick={() => setFilter("all")}
            >
              All Friends
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <FaSearch className={styles.searchIcon} />
          <input
            placeholder="Search friends..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className={styles.list}>
        {filteredList.map((user) => (
          <div key={user.id} className={styles.userCard}>
            {/* Avatar Area */}
            <div className={styles.avatarWrap}>
              {renderAvatar(user)}
              <span className={`${styles.dot} ${styles[user.status]}`}></span>
            </div>

            {/* Info Area */}
            <div className={styles.info}>
              <span className={styles.name}>{user.name}</span>
              <span className={styles.msg}>
                {user.statusMsg ||
                  (user.status === "offline" ? "Offline" : "—")}
              </span>
            </div>

            {/* More Button & Menu */}
            <div className={styles.actionArea}>
              <button
                className={`${styles.moreBtn} ${
                  activeMenu === user.id ? styles.btnActive : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenu(activeMenu === user.id ? null : user.id);
                }}
              >
                <RiMore2Fill />
              </button>

              {/* Popup Menu */}
              {activeMenu === user.id && (
                <div className={styles.popupMenu} ref={menuRef}>
                  <div className={styles.menuItem}>
                    <FaUserMinus className={styles.menuIcon} /> Unfollow
                  </div>
                  <div className={styles.menuItem}>
                    <FaUserPlus className={styles.menuIcon} /> Add to Close
                  </div>
                  <div className={`${styles.menuItem} ${styles.dangerItem}`}>
                    <FaUserSlash className={styles.menuIcon} /> Block
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredList.length === 0 && (
          <p className={styles.empty}>No friends found.</p>
        )}
      </div>
    </div>
  );
};

export default FriendRoster;
