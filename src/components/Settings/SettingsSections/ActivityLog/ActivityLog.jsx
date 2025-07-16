import React, { useState } from "react";
import styles from "./ActivityLog.module.css";
import { FiHeart, FiMessageCircle, FiTag, FiImage } from "react-icons/fi";

const tabs = [
  { label: "Likes", icon: <FiHeart /> },
  { label: "Comments", icon: <FiMessageCircle /> },
  { label: "Tags", icon: <FiTag /> },
  { label: "Media", icon: <FiImage /> }
];

const dummyActivities = {
  Likes: [
    { type: "Post", content: "You liked a post by @techguru", date: "2h ago" },
    { type: "Reel", content: "You liked a reel from @naturelife", date: "1d ago" }
  ],
  Comments: [
    { type: "Post", content: "You commented on @john's post: 'Amazing!'", date: "3h ago" },
    { type: "Video", content: "You commented: '🔥🔥🔥'", date: "2d ago" }
  ],
  Tags: [
    { type: "Photo", content: "You were tagged in a photo by @friends", date: "5h ago" }
  ],
  Media: [
    { type: "Story", content: "You viewed @dailytravel's story", date: "1h ago" },
    { type: "Post", content: "You shared @artdesign's post", date: "3d ago" }
  ]
};

const ActivityLog = () => {
  const [activeTab, setActiveTab] = useState("Likes");

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>Activity Log</h2>
      <p className={styles.subtext}>
        Here’s a log of your recent activity including likes, comments, tags, and more.
      </p>

      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.label}
            className={`${styles.tabBtn} ${
              activeTab === tab.label ? styles.active : ""
            }`}
            onClick={() => setActiveTab(tab.label)}
          >
            {tab.icon} <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className={styles.activityList}>
        {dummyActivities[activeTab].map((item, index) => (
          <div key={index} className={styles.activityCard}>
            <span className={styles.type}>{item.type}</span>
            <p className={styles.content}>{item.content}</p>
            <span className={styles.date}>{item.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityLog;
