import React, { useState } from "react";
import { IoIosSettings } from "react-icons/io";
import styles from "./MobileProfile.module.css";
import { Link } from "react-router-dom";
import { useUser } from "../../../context/UserContext";
import LoadingOverlay from "../../LoadingOverlay/LoadingOverlay";
import ConnectionsModal from "../../ConnectionsModal/ConnectionsModal"; // Modal import edildi

const MobileProfile = () => {
  const { currentUser, loading } = useUser();
  const [activeTab, setActiveTab] = useState("posts");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);

  const tabs = [
    { key: "posts", label: "Posts" },
    { key: "feeds", label: "Feeds" },
    { key: "likes", label: "Liked" },
    { key: "tags", label: "Tagged" },
  ];

  if (loading) return <LoadingOverlay />;
  if (!currentUser) return <div>Lütfen giriş yapın.</div>;

  const { username, displayName, photoURL, bio, familySystem, stats, uid } = currentUser;

  const tabMessages = {
    posts: `${displayName || username}, henüz bir gönderi paylaşmadınız.`,
    feeds: `${displayName || username}, henüz feedleriniz bulunmamaktadır.`,
    likes: `${displayName || username}, henüz bir gönderiyi beğenmediniz.`,
    tags: `${displayName || username}, henüz etiketlendiğiniz bir gönderi bulunmamaktadır.`,
  };

  const handleStatClick = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.username}>{username}</div>
        <div className={styles.actions}>
          <Link to="/settings" className={styles.actionBtn}>
            <IoIosSettings className={styles.icon} />
          </Link>
        </div>
      </header>

      <div className={styles.profileBackground}></div>

      <div className={styles.profileInfo}>
        <div className={styles.avatarContainer}>
          <div className={styles.avatarWrapper}>
            <img src={photoURL} alt="Profile" className={styles.avatar} />
          </div>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat_content}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{stats.posts}</span>
              <span className={styles.statLabel}>Posts</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{stats.rta}</span>
              <span className={styles.statLabel}>RTA</span>
            </div>
          </div>
          <div className={styles.stat_content}>
            <div
              className={styles.stat}
              onClick={() => handleStatClick("followers")}
              style={{ cursor: "pointer" }}
            >
              <span className={styles.statNumber}>{stats.followers}</span>
              <span className={styles.statLabel}>Followers</span>
            </div>
            <div
              className={styles.stat}
              onClick={() => handleStatClick("following")}
              style={{ cursor: "pointer" }}
            >
              <span className={styles.statNumber}>{stats.following}</span>
              <span className={styles.statLabel}>Following</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bioSection}>
        <h1 className={styles.name}>{displayName}</h1>
        {familySystem && <div className={styles.tag}>{familySystem}</div>}
        <p className={styles.bioText}>{bio || "Henüz bir biyografi eklemediniz."}</p>
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
            className={`${styles.tab} ${activeTab === key ? styles.activeTab : ""}`}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={styles.tabContent}>
        <div className={styles.postsGrid}>
          {activeTab === "posts" && <p>{tabMessages.posts}</p>}
          {activeTab === "feeds" && <p>{tabMessages.feeds}</p>}
          {activeTab === "likes" && <p>{tabMessages.likes}</p>}
          {activeTab === "tags" && <p>{tabMessages.tags}</p>}
        </div>
      </div>

      {showModal && (
        <ConnectionsModal
          show={showModal}
          onClose={() => setShowModal(false)}
          listType={modalType}
          currentUserId={uid}
        />
      )}
    </div>
  );
};

export default MobileProfile;
