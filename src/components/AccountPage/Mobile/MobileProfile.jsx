import React, { useState } from "react";
import { IoIosSettings } from "react-icons/io";
import styles from "./MobileProfile.module.css";

const MobileProfile = () => {
  const [activeTab, setActiveTab] = useState("posts");

  const tabs = [
    { key: "posts", label: "Posts" },
    { key: "feeds", label: "Feeds" },
    { key: "likes", label: "Liked" },
    { key: "tags", label: "Tagged" },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.username}>furkan_theclifen</div>
        <div className={styles.actions}>
          <button className={styles.actionBtn}>
            <IoIosSettings className={styles.icon} />
          </button>
        </div>
      </header>

      <div className={styles.profileBackground}></div>

      <div className={styles.profileInfo}>
        <div className={styles.avatarContainer}>
          <div className={styles.avatarWrapper}>
            <img
              src="https://i.pinimg.com/1200x/a0/e9/f8/a0e9f8f125872966759bb388697f238e.jpg"
              alt="Profile"
              className={styles.avatar}
            />
          </div>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat_content}>
            <div className={styles.stat}>
            <span className={styles.statNumber}>120</span>
            <span className={styles.statLabel}>Posts</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>340</span>
            <span className={styles.statLabel}>RTA</span>
          </div>
          </div>
          <div className={styles.stat_content}>
            <div className={styles.stat}>
            <span className={styles.statNumber}>875</span>
            <span className={styles.statLabel}>Followers</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>52</span>
            <span className={styles.statLabel}>Following</span>
          </div>
          </div>
        </div>
      </div>

      <div className={styles.bioSection}>
        <h1 className={styles.name}>Furkan ThecLifeN</h1>
        <div className={styles.tag}>#aile_sistemi</div>
        <p className={styles.bioText}>
          Yazılımın, tasarımın ve sistemin birleştiği noktadayım. Her satırda
          bir hayat, her renkte bir anlam var.
        </p>
      </div>

      <div className={styles.actionButtons}>
        <button className={styles.editButton}>Edit Profile</button>
        <button className={styles.shareButton}>Share Profile</button>
      </div>

      <div className={styles.highlights}>
        {["Story 1", "Story 2", "Story 3"].map((label, index) => (
          <div key={index} className={styles.highlightItem}>
            <div className={styles.highlightSquare}></div>
            <span className={styles.highlightLabel}>{label}</span>
          </div>
        ))}
      </div>

      <div className={styles.tabs}>
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            className={`${styles.tab} ${
              activeTab === key ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={styles.tabContent}>
        {activeTab === "posts" && (
          <div className={styles.postsGrid}>
            {[1, 2, 3, 4, 5, 6].map((post) => (
              <div key={post} className={styles.postItem}>
                <img
                  src={`https://picsum.photos/300/300?random=${post}`}
                  alt={`Post ${post}`}
                  className={styles.postImage}
                />
              </div>
            ))}
          </div>
        )}
        {activeTab === "feeds" && (
          <div className={styles.feedsContent}>
            <p>Your feeds will appear here</p>
          </div>
        )}
        {activeTab === "likes" && (
          <div className={styles.likesContent}>
            <p>Liked posts will appear here</p>
          </div>
        )}
        {activeTab === "tags" && (
          <div className={styles.tagsContent}>
            <p>Tagged photos will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileProfile;