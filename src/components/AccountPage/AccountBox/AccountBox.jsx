import React, { useState } from "react";
import styles from "./AccountBox.module.css";
import { IoIosSettings } from "react-icons/io";
import { useNavigate } from "react-router-dom";

const AccountBox = () => {
  const [activeTab, setActiveTab] = useState("posts");
  const navigate = useNavigate();

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.account_top}>
        <div className={styles.fixedTopBox}>furkan_theclifen</div>
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
              src="https://i.pinimg.com/1200x/a0/e9/f8/a0e9f8f125872966759bb388697f238e.jpg"
              alt="Profile"
              className={styles.profileImage}
            />
          </div>
          <div className={styles.imageBackground}></div>
        </div>

        <div className={styles.profileInfoSection}>
          <h2 className={styles.profileName}>Furkan ThecLifeN</h2>
          <div className={styles.tagBox}>aile_sistemi</div>
          <div className={styles.bio}>
            Yazılımın, tasarımın ve sistemin birleştiği noktadayım. Her satırda
            bir hayat, her renkte bir anlam var.
          </div>
        </div>

        <div className={styles.statsSection}>
          <div className={styles.statBox}>
            <strong>120</strong>
            <span className={styles.statLabel}>Posts</span>
          </div>
          <div className={styles.statBox}>
            <strong>340</strong>
            <span className={styles.statLabel}>RTA</span>
          </div>
          <div className={styles.statBox}>
            <strong>875</strong>
            <span className={styles.statLabel}>Followers</span>
          </div>
          <div className={styles.statBox}>
            <strong>52</strong>
            <span className={styles.statLabel}>Following</span>
          </div>
        </div>
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
          <div className={styles.section}>Postlar burada gösterilecek</div>
        )}
        {activeTab === "feeds" && (
          <div className={styles.section}>Feedler burada gösterilecek</div>
        )}
        {activeTab === "likes" && (
          <div className={styles.section}>Beğenilen içerikler burada</div>
        )}
        {activeTab === "tags" && (
          <div className={styles.section}>Etiketlenmiş gönderiler burada</div>
        )}
      </div>
    </div>
  );
};

export default AccountBox;
