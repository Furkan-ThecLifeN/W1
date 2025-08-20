import React, { useState } from "react";
import {
  FiMessageSquare,
  FiCamera,
  FiUser,
  FiUserPlus,
  FiUserX,
  FiCheck,
  FiX,
} from "react-icons/fi";
import styles from "./MessagesStoryReplies.module.css";
import { useUser } from "../../../../context/UserContext";

const MessagesStoryReplies = () => {
  const { currentUser, updatePrivacySettings, loading } = useUser();

  // Bileşen durumunu arka uçtan gelen verilerle başlatın
  const [localSettings, setLocalSettings] = useState({
    whoCanMessage: currentUser?.privacySettings?.messages || "everyone",
    allowStoryReplies: currentUser?.privacySettings?.storyReplies || true,
    // ✅ YENİ: Hikaye yanıtı kitlesi için yerel durum eklendi
    storyReplyAudience: "everyone",
  });

  // Custom list management
  const [showCustomList, setShowCustomList] = useState(false);
  const [customListType, setCustomListType] = useState(null); // 'allow' or 'deny'
  const [searchTerm, setSearchTerm] = useState("");

  // Örnek takipçi verisi
  const [followers, setFollowers] = useState([
    {
      id: 1,
      name: "Alex Johnson",
      username: "alexj",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      allowed: true,
      denied: false,
    },
    {
      id: 2,
      name: "Sarah Miller",
      username: "sarahm",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      allowed: false,
      denied: false,
    },
    {
      id: 3,
      name: "David Kim",
      username: "davidk",
      avatar: "https://randomuser.me/api/portraits/men/22.jpg",
      allowed: false,
      denied: true,
    },
    {
      id: 4,
      name: "Emma Wilson",
      username: "emmaw",
      avatar: "https://randomuser.me/api/portraits/women/33.jpg",
      allowed: true,
      denied: false,
    },
    {
      id: 5,
      name: "Michael Chen",
      username: "michaelc",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
      allowed: false,
      denied: false,
    },
  ]);

  const toggleMessageSetting = (value) => {
    setLocalSettings((prev) => ({
      ...prev,
      whoCanMessage: value,
    }));
    updatePrivacySettings({
      type: "messages",
      data: { messages: value },
    });
  };

  const toggleStoryReplies = () => {
    const newValue = !localSettings.allowStoryReplies;
    setLocalSettings((prev) => ({
      ...prev,
      allowStoryReplies: newValue,
    }));
    updatePrivacySettings({
      type: "storyReplies",
      data: { storyReplies: newValue },
    });
  };

  // ✅ YENİ: Hikaye yanıtı kitlesini yöneten fonksiyon
  const toggleStoryReplyAudience = (value) => {
    setLocalSettings((prev) => ({
      ...prev,
      storyReplyAudience: value,
    }));
    // Arka uç için storyReplies'ı her zaman true yap
    updatePrivacySettings({
      type: "storyReplies",
      data: { storyReplies: true },
    });
  };

  const toggleUserPermission = (userId, type) => {
    setFollowers((prev) =>
      prev.map((user) => {
        if (user.id === userId) {
          if (type === "allow") {
            return { ...user, allowed: !user.allowed, denied: false };
          } else {
            return { ...user, denied: !user.denied, allowed: false };
          }
        }
        return user;
      })
    );
  };

  const openCustomList = (type) => {
    setCustomListType(type);
    setShowCustomList(true);
  };

  const filteredFollowers = followers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <span>Ayarlar yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Messages & Story Replies</h1>
        <p className={styles.subtitle}>
          Control who can contact you and reply to your stories
        </p>
      </div>

      <div className={styles.settingsContainer}>
        {/* Messages Settings */}
        <div className={styles.settingCard}>
          <div className={styles.settingHeader}>
            <FiMessageSquare className={styles.settingIcon} />
            <h2 className={styles.settingTitle}>Direct Messages</h2>
          </div>

          <div className={styles.optionGroup}>
            <div
              className={`${styles.option} ${
                localSettings.whoCanMessage === "everyone" ? styles.active : ""
              }`}
              onClick={() => toggleMessageSetting("everyone")}
            >
              <div className={styles.optionContent}>
                <FiUser className={styles.optionIcon} />
                <div>
                  <h3 className={styles.optionTitle}>Everyone</h3>
                  <p className={styles.optionDescription}>
                    Anyone on the platform can message you
                  </p>
                </div>
              </div>
              {localSettings.whoCanMessage === "everyone" && (
                <FiCheck className={styles.checkIcon} />
              )}
            </div>

            <div
              className={`${styles.option} ${
                localSettings.whoCanMessage === "followers" ? styles.active : ""
              }`}
              onClick={() => toggleMessageSetting("followers")}
            >
              <div className={styles.optionContent}>
                <FiUserPlus className={styles.optionIcon} />
                <div>
                  <h3 className={styles.optionTitle}>People You Follow</h3>
                  <p className={styles.optionDescription}>
                    Only people you follow can message you
                  </p>
                </div>
              </div>
              {localSettings.whoCanMessage === "followers" && (
                <FiCheck className={styles.checkIcon} />
              )}
            </div>

            <div
              className={`${styles.option} ${
                localSettings.whoCanMessage === "no" ? styles.active : ""
              }`}
              onClick={() => toggleMessageSetting("no")}
            >
              <div className={styles.optionContent}>
                <FiUserX className={styles.optionIcon} />
                <div>
                  <h3 className={styles.optionTitle}>No One</h3>
                  <p className={styles.optionDescription}>
                    No one can send you a message
                  </p>
                </div>
              </div>
              {localSettings.whoCanMessage === "no" && (
                <FiCheck className={styles.checkIcon} />
              )}
            </div>
          </div>

          <div className={styles.customControls}>
            <button
              className={styles.customButton}
              onClick={() => openCustomList("allow")}
            >
              Allow specific users
            </button>
            <button
              className={styles.customButton}
              onClick={() => openCustomList("deny")}
            >
              Block specific users
            </button>
          </div>
        </div>

        {/* Story Replies Settings */}
        <div className={styles.settingCard}>
          <div className={styles.settingHeader}>
            <FiCamera className={styles.settingIcon} />
            <h2 className={styles.settingTitle}>Story Replies</h2>
          </div>

          <div className={styles.toggleOption}>
            <div className={styles.toggleContent}>
              <h3 className={styles.toggleTitle}>Allow Story Replies</h3>
              <p className={styles.toggleDescription}>
                Let people reply to your stories
              </p>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={localSettings.allowStoryReplies}
                onChange={toggleStoryReplies}
              />
              <span className={styles.slider}></span>
            </label>
          </div>

          {/* ✅ YENİ: Anahtar açıkken seçenekler gösterilir */}
          {localSettings.allowStoryReplies && (
            <div className={styles.optionGroup}>
              <div
                className={`${styles.option} ${
                  localSettings.storyReplyAudience === "everyone"
                    ? styles.active
                    : ""
                }`}
                onClick={() => toggleStoryReplyAudience("everyone")}
              >
                <div className={styles.optionContent}>
                  <FiUser className={styles.optionIcon} />
                  <div>
                    <h3 className={styles.optionTitle}>Everyone</h3>
                    <p className={styles.optionDescription}>
                      Anyone can reply to your stories
                    </p>
                  </div>
                </div>
                {localSettings.storyReplyAudience === "everyone" && (
                  <FiCheck className={styles.checkIcon} />
                )}
              </div>

              <div
                className={`${styles.option} ${
                  localSettings.storyReplyAudience === "closeFriends"
                    ? styles.active
                    : ""
                }`}
                onClick={() => toggleStoryReplyAudience("closeFriends")}
              >
                <div className={styles.optionContent}>
                  <FiUserPlus className={styles.optionIcon} />
                  <div>
                    <h3 className={styles.optionTitle}>Close Friends</h3>
                    <p className={styles.optionDescription}>
                      Only your close friends can reply
                    </p>
                  </div>
                </div>
                {localSettings.storyReplyAudience === "closeFriends" && (
                  <FiCheck className={styles.checkIcon} />
                )}
              </div>
            </div>
          )}

          <div className={styles.customControls}>
            <button
              className={styles.customButton}
              onClick={() => openCustomList("allow")}
            >
              Allow specific users
            </button>
            <button
              className={styles.customButton}
              onClick={() => openCustomList("deny")}
            >
              Block specific users
            </button>
          </div>
        </div>
      </div>

      {/* Custom List Modal */}
      {showCustomList && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {customListType === "allow" ? "Allow List" : "Block List"}
              </h2>
              <button
                className={styles.closeButton}
                onClick={() => setShowCustomList(false)}
              >
                <FiX />
              </button>
            </div>

            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search followers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.userList}>
              {filteredFollowers.length > 0 ? (
                filteredFollowers.map((user) => (
                  <div key={user.id} className={styles.userItem}>
                    <div className={styles.userInfo}>
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className={styles.userAvatar}
                      />
                      <div>
                        <h3 className={styles.userName}>{user.name}</h3>
                        <p className={styles.userUsername}>@{user.username}</p>
                      </div>
                    </div>
                    <button
                      className={`${styles.permissionButton} ${
                        customListType === "allow" && user.allowed
                          ? styles.allowed
                          : customListType === "deny" && user.denied
                          ? styles.denied
                          : ""
                      }`}
                      onClick={() =>
                        toggleUserPermission(user.id, customListType)
                      }
                    >
                      {customListType === "allow" && user.allowed
                        ? "Allowed"
                        : customListType === "deny" && user.denied
                        ? "Blocked"
                        : customListType === "allow"
                        ? "Allow"
                        : "Block"}
                    </button>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <p>No followers found</p>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.saveButton}
                onClick={() => setShowCustomList(false)}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesStoryReplies;