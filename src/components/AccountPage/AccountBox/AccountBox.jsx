// src/components/AccountBox/AccountBox.js
import React, { useState } from "react";
import { IoIosSettings } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import styles from "./AccountBox.module.css";
import { useUser } from "../../../context/UserContext";
import LoadingOverlay from "../../LoadingOverlay/LoadingOverlay";
import FollowersFollowingPage from "../../FollowersFollowingPage/FollowersFollowingPage";

const AccountBox = () => {
  const { currentUser, loading } = useUser();
  const [activeTab, setActiveTab] = useState("posts");
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState(null);

  if (loading) {
    return <LoadingOverlay />;
  }

  if (!currentUser) {
    // Kullanıcı giriş yapmamışsa veya verisi yoksa
    return <div>Lütfen giriş yapın.</div>;
  }

  const { username, displayName, photoURL, bio, familySystem, stats } = currentUser;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.account_top}>
        <div className={styles.fixedTopBox}>{username}</div>
        <div className={styles.fixedSettingsBtn}>
          <button
            className={styles.actionBtn}
            onClick={() => navigate("/settings")}
          >
            <IoIosSettings className={styles.icon} />
          </button>
        </div>
      </div>

      <div className={styles.mainProfileBox}>
        <div className={styles.profileImageSection}>
          <div className={styles.profileImageWrapper}>
            <img
              src={photoURL}
              alt="Profile"
              className={styles.profileImage}
            />
          </div>
          <div className={styles.imageBackground}></div>
        </div>

        <div className={styles.profileInfoSection}>
          <h2 className={styles.profileName}>{displayName}</h2>
          {familySystem && (
            <div className={styles.tagBox}>{familySystem}</div>
          )}
          <div className={styles.bio}>
            {bio || "Henüz bir biyografi eklemediniz."}
          </div>
        </div>

        <div className={styles.statsSection}>
          <div className={styles.statBox}>
            <strong>{stats.posts}</strong>
            <span className={styles.statLabel}>Posts</span>
          </div>
          <div className={styles.statBox}>
            <strong>{stats.rta}</strong>
            <span className={styles.statLabel}>RTA</span>
          </div>
          <div
            className={styles.statBox}
            onClick={() => setActivePage("followers")}
          >
            <strong>{stats.followers}</strong>
            <span className={styles.statLabel}>Followers</span>
          </div>
          <div
            className={styles.statBox}
            onClick={() => setActivePage("following")}
          >
            <strong>{stats.following}</strong>
            <span className={styles.statLabel}>Following</span>
          </div>
        </div>

        {activePage && (
          <div className={styles.overlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <span>{activePage === "followers" ? "Takipçiler" : "Takip Edilenler"}</span>
                <button className={styles.closeBtn} onClick={() => setActivePage(null)}>
                  &times;
                </button>
              </div>
              <div className={styles.modalContent}>
                <FollowersFollowingPage type={activePage} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.tabBar}>
        <button
          className={activeTab === "posts" ? styles.active : ""}
          onClick={() => setActiveTab("posts")}
        >
          Post
        </button>
        <button
          className={activeTab === "feeds" ? styles.active : ""}
          onClick={() => setActiveTab("feeds")}
        >
          Feeds
        </button>
        <button
          className={activeTab === "likes" ? styles.active : ""}
          onClick={() => setActiveTab("likes")}
        >
          Beğenilen
        </button>
        <button
          className={activeTab === "tags" ? styles.active : ""}
          onClick={() => setActiveTab("tags")}
        >
          Etiketlenen
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === "posts" && (
          <div className={styles.section}>{displayName || username}, henüz bir gönderi paylaşmadınız.</div>
        )}
        {activeTab === "feeds" && (
          <div className={styles.section}>{displayName || username}, henüz feedleriniz bulunmamaktadır.</div>
        )}
        {activeTab === "likes" && (
          <div className={styles.section}>{displayName || username}, henüz bir gönderiyi beğenmediniz.</div>
        )}
        {activeTab === "tags" && (
          <div className={styles.section}>{displayName || username}, henüz etiketlendiğiniz bir gönderi bulunmamaktadır.</div>
        )}
      </div>
    </div>
  );
};

export default AccountBox;