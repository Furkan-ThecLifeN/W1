import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./UserProfile.module.css";
// useAuth hook'unu yeni showToast fonksiyonu için import edin
import { useAuth } from "../../context/AuthProvider";
import LoadingOverlay from "../LoadingOverlay/LoadingOverlay";
import FollowersFollowingPage from "../FollowersFollowingPage/FollowersFollowingPage";
import {
  FaUserPlus,
  FaUserMinus,
  FaUserTimes,
  FaEllipsisV,
  FaBan,
  FaFlag,
  FaCommentDots,
  FaLock,
} from "react-icons/fa";
import axios from "axios";

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  // ✅ GÜNCELLENDİ: useAuth'dan showToast fonksiyonunu alın
  const { currentUser, showToast } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [activePage, setActivePage] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [followStatus, setFollowStatus] = useState("none"); // 'none', 'pending', 'following', 'self'
  const apiBaseUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchUserProfileAndStatus = async () => {
      setLoading(true);
      setError(null);
      try {
        const idToken = await currentUser.getIdToken();
        const profileRes = await axios.get(
          `${apiBaseUrl}/api/users/profile/${username}`,
          {
            headers: { Authorization: `Bearer ${idToken}` },
          }
        );
        const profile = profileRes.data.profile;
        setProfileData(profile);

        const statusRes = await axios.get(
          `${apiBaseUrl}/api/users/profile/${profile.uid}/status`,
          {
            headers: { Authorization: `Bearer ${idToken}` },
          }
        );
        setFollowStatus(statusRes.data.followStatus);
      } catch (err) {
        console.error("Profil veya takip durumu çekme hatası:", err);
        setError("Profil bilgileri yüklenemedi.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfileAndStatus();
  }, [username, currentUser, apiBaseUrl]);

  // ✅ GÜNCELLENDİ: Optimist UI için handleFollowAction
  const handleFollowAction = async () => {
    const previousFollowStatus = followStatus;
    const isPrivate = profileData?.isPrivate;

    // UI'ı anında güncelle
    try {
      if (previousFollowStatus === "none") {
        setFollowStatus(isPrivate ? "pending" : "following");
      } else {
        setFollowStatus("none");
      }

      const idToken = await currentUser.getIdToken();
      let endpoint;
      let method;
      let data = {};

      if (previousFollowStatus === "none") {
        endpoint = `${apiBaseUrl}/api/users/follow`;
        method = "POST";
        data = { targetUid: profileData.uid };
      } else if (previousFollowStatus === "pending") {
        endpoint = `${apiBaseUrl}/api/users/follow/request/retract`;
        method = "DELETE";
        data = { targetUid: profileData.uid };
      } else if (previousFollowStatus === "following") {
        endpoint = `${apiBaseUrl}/api/users/unfollow/${profileData.uid}`;
        method = "DELETE";
      } else {
        return;
      }

      const response = await axios({
        method: method,
        url: endpoint,
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        data: data,
      });

      // API'den gelen son durumu ayarla ve başarı mesajını göster
      setFollowStatus(response.data.status || "none");
      showToast(response.data.message, "success");

      // İşlem başarılı, profil bilgilerini yeniden çek
      const updatedProfileRes = await axios.get(
        `${apiBaseUrl}/api/users/profile/${username}`,
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );
      setProfileData(updatedProfileRes.data.profile);
    } catch (err) {
      console.error("Takip işlemi hatası:", err.response ? err.response.data : err.message);
      // Hata durumunda UI'ı eski durumuna geri getir
      setFollowStatus(previousFollowStatus);
      const errorMsg = err.response?.data?.error || "Takip işlemi başarısız.";
      showToast(errorMsg, "error");
    }
  };

  const handleMessageAction = async () => {
    const messageContent = prompt("Göndermek istediğiniz mesajı yazın:");
    if (!messageContent) return;
    try {
      const idToken = await currentUser.getIdToken();
      const response = await axios.post(
        `${apiBaseUrl}/api/users/message`,
        {
          targetUid: profileData.uid,
          messageContent: messageContent,
        },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      showToast(response.data.message, "success");
    } catch (err) {
      console.error(
        "Mesaj gönderme hatası:",
        err.response ? err.response.data : err.message
      );
      const errorMsg = err.response?.data?.error || "Mesaj gönderme başarısız.";
      showToast(errorMsg, "error");
    }
  };

  const handleBlockUser = async () => {
    // Engelleme işlemi için backend endpoint'i eklenmeli
    showToast("Kullanıcı engellendi.", "success");
    setShowDropdown(false);
  };

  const handleReportUser = async () => {
    // Şikayet işlemi için backend endpoint'i eklenmeli
    showToast("Kullanıcı şikayet edildi.", "success");
    setShowDropdown(false);
  };

  const handleFeedback = () => {
    // Görüş bildirme işlemi
    showToast("Geri bildirim sayfanız açıldı.", "info");
    setShowDropdown(false);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  if (loading) {
    return <LoadingOverlay />;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!profileData) {
    return <div>Kullanıcı profili bulunamadı.</div>;
  }
  
  const canViewContent =
    !profileData.isPrivate || followStatus === "following" || followStatus === "self";

  const { displayName, photoURL, bio, familySystem, stats } = profileData;

  const renderFollowButton = () => {
    switch (followStatus) {
      case "self":
        return null;
      case "following":
        return (
          <button onClick={handleFollowAction} className={`${styles.unfollowBtn} ${styles.actionButton}`}>
            <FaUserMinus /> Takibi Bırak
          </button>
        );
      case "pending":
        return (
          <button onClick={handleFollowAction} className={`${styles.pendingBtn} ${styles.actionButton}`}>
            <FaUserTimes /> İstek Gönderildi
          </button>
        );
      case "none":
      default:
        return (
          <button onClick={handleFollowAction} className={`${styles.followBtn} ${styles.actionButton}`}>
            <FaUserPlus /> Takip Et
          </button>
        );
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.account_top}>
        <div className={styles.fixedTopBox}>{username}</div>
        {followStatus !== "self" && (
          <div className={styles.fixedSettingsBtn}>
            <button className={styles.actionBtn} onClick={toggleDropdown}>
              <FaEllipsisV className={styles.icon} />
            </button>
            {showDropdown && (
              <div className={styles.dropdownMenu}>
                <button
                  className={styles.dropdownItem}
                  onClick={handleBlockUser}
                >
                  <FaBan /> Engelle
                </button>
                <button
                  className={styles.dropdownItem}
                  onClick={handleReportUser}
                >
                  <FaFlag /> Şikayet Et
                </button>
                <button
                  className={styles.dropdownItem}
                  onClick={handleFeedback}
                >
                  <FaCommentDots /> Geri Bildirim Ver
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {followStatus !== "self" && (
        <div className={styles.buttonsContainer}>
          {renderFollowButton()}
          <button
            onClick={handleMessageAction}
            className={`${styles.messageBtn} ${styles.actionButton}`}
          >
            <FaCommentDots /> Mesaj
          </button>
        </div>
      )}

      <div className={styles.mainProfileBox}>
        <div className={styles.profileImageSection}>
          <div className={styles.profileImageWrapper}>
            <img src={photoURL} alt="Profile" className={styles.profileImage} />
          </div>
          <div className={styles.imageBackground}></div>
        </div>

        <div className={styles.profileInfoSection}>
          <h2 className={styles.profileName}>{displayName}</h2>
          {familySystem && <div className={styles.tagBox}>{familySystem}</div>}
          <div className={styles.bio}>
            {bio || "Henüz bir biyografi eklenmedi."}
          </div>
        </div>

        <div className={styles.statsSection}>
          <div className={styles.statBox}>
            <strong>{stats?.posts || 0}</strong>
            <span className={styles.statLabel}>Post</span>
          </div>
          <div className={styles.statBox}>
            <strong>{stats?.rta || 0}</strong>
            <span className={styles.statLabel}>RTA</span>
          </div>
          <div
            className={styles.statBox}
            onClick={() => setActivePage("followers")}
          >
            <strong>{stats?.followers || 0}</strong>
            <span className={styles.statLabel}>Takipçi</span>
          </div>
          <div
            className={styles.statBox}
            onClick={() => setActivePage("following")}
          >
            <strong>{stats?.following || 0}</strong>
            <span className={styles.statLabel}>Takip Edilen</span>
          </div>
        </div>

        {activePage && (
          <div className={styles.overlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <span>
                  {activePage === "followers" ? "Takipçiler" : "Takip Edilenler"}
                </span>
                <button
                  className={styles.closeBtn}
                  onClick={() => setActivePage(null)}
                >
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
          disabled={!canViewContent}
        >
          Post
        </button>
        <button
          className={activeTab === "feeds" ? styles.active : ""}
          onClick={() => setActiveTab("feeds")}
          disabled={!canViewContent}
        >
          Feeds
        </button>
        <button
          className={activeTab === "likes" ? styles.active : ""}
          onClick={() => setActiveTab("likes")}
          disabled={!canViewContent}
        >
          Beğenilen
        </button>
        <button
          className={activeTab === "tags" ? styles.active : ""}
          onClick={() => setActiveTab("tags")}
          disabled={!canViewContent}
        >
          Etiketlenen
        </button>
      </div>

      <div className={styles.tabContent}>
        {
          !canViewContent ? (
            <div className={styles.private_message}>
              <FaLock className={styles.privateAccountIcon} />
              <h3>Bu hesap gizlidir.</h3>
              <p>İçeriği görmek için takip etmelisiniz.</p>
            </div>
          ) : (
            <>
              {activeTab === "posts" && (
                <div className={styles.section}>
                  {displayName || username}, henüz bir gönderi paylaşmadı.
                </div>
              )}
              {activeTab === "feeds" && (
                <div className={styles.section}>
                  {displayName || username}, henüz feedleri bulunmamaktadır.
                </div>
              )}
              {activeTab === "likes" && (
                <div className={styles.section}>
                  {displayName || username}, henüz bir gönderiyi beğenmedi.
                </div>
              )}
              {activeTab === "tags" && (
                <div className={styles.section}>
                  {displayName || username}, henüz etiketlendiği bir gönderi
                  bulunmamaktadır.
                </div>
              )}
            </>
          )
        }
      </div>
    </div>
  );
};

export default UserProfile;