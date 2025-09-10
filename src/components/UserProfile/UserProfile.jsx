import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./UserProfile.module.css";
import { useAuth } from "../../context/AuthProvider";
import LoadingOverlay from "../LoadingOverlay/LoadingOverlay";
import ConnectionsModal from "../ConnectionsModal/ConnectionsModal";
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
import { db } from "../../config/firebase-client";
import {
  collection,
  query,
  getDocs,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";

// Importing the content components
import PostCard from "../AccountPage/Box/PostBox/PostBox";
import TweetCard from "../AccountPage/Box/FeelingsBox/FeelingsBox";
import VideoThumbnail from "../AccountPage/Box/VideoFeedItem/VideoThumbnail/VideoThumbnail";
import VideoFeedItem from "../AccountPage/Box/VideoFeedItem/VideoFeedItem";

// Constants
const ITEMS_PER_PAGE = 10;

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { currentUser, showToast } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("posts");
  const [showDropdown, setShowDropdown] = useState(false);
  const [followStatus, setFollowStatus] = useState("none");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [userData, setUserData] = useState([]); // Selected user's content
  const [loadingContent, setLoadingContent] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [contentCounts, setContentCounts] = useState({
    posts: 0,
    feeds: 0,
    feelings: 0,
  });

  const apiBaseUrl = process.env.REACT_APP_API_URL;

  // Function to fetch the user's content (posts, feeds, etc.)
  const fetchUserContent = async (type, isInitialLoad = true) => {
    if (!profileData?.uid) return;
    setLoadingContent(true);
    let collectionPath;

    switch (type) {
      case "posts":
      case "feelings":
      case "feeds":
        collectionPath = `users/${profileData.uid}/${type}`;
        break;
      case "likes":
      case "tags":
      default:
        console.warn(`${type} fetching not implemented for UserProfile.`);
        setLoadingContent(false);
        return;
    }

    let q;
    if (isInitialLoad) {
      setUserData([]);
      setLastVisible(null);
      setHasMore(true);
      q = query(
        collection(db, collectionPath),
        orderBy("createdAt", "desc"),
        limit(ITEMS_PER_PAGE)
      );
    } else {
      if (!lastVisible) {
        setLoadingContent(false);
        return;
      }
      q = query(
        collection(db, collectionPath),
        orderBy("createdAt", "desc"),
        startAfter(lastVisible),
        limit(ITEMS_PER_PAGE)
      );
    }

    try {
      const querySnapshot = await getDocs(q);
      const fetchedData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      let filteredData = fetchedData;
      if (type === "feeds") {
        filteredData = fetchedData.filter((item) => item.mediaUrl);
      }

      setUserData((prevData) => {
        const newData = filteredData.filter(
          (item) => !prevData.some((existingItem) => existingItem.id === item.id)
        );
        return [...prevData, ...newData];
      });

      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setHasMore(fetchedData.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error("Veri çekme hatası:", error);
    } finally {
      setLoadingContent(false);
    }
  };

  const fetchContentCounts = async (profileUid) => {
    if (!profileUid) return;
    try {
      const postsCount = (await getDocs(collection(db, `users/${profileUid}/posts`))).size;
      const feelingsCount = (await getDocs(collection(db, `users/${profileUid}/feelings`))).size;
      const feedsCount = (await getDocs(collection(db, `users/${profileUid}/feeds`))).size;

      setContentCounts({
        posts: postsCount,
        feeds: feedsCount,
        feelings: feelingsCount,
      });
    } catch (error) {
      console.error("Koleksiyon sayıları çekme hatası:", error);
      setContentCounts({
        posts: 0,
        feeds: 0,
        feelings: 0,
      });
    }
  };

  // Effect to fetch user profile and follow status on initial load
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
        const status = statusRes.data.followStatus;
        setFollowStatus(status);

        const canView = !profile.isPrivate || status === "following" || status === "self";
        if (canView) {
          fetchContentCounts(profile.uid);
        } else {
          setContentCounts({
            posts: 0,
            feeds: 0,
            feelings: 0,
          });
        }
      } catch (err) {
        console.error("Profil veya takip durumu çekme hatası:", err);
        setError("Profil bilgileri yüklenemedi.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfileAndStatus();
  }, [username, currentUser, apiBaseUrl]);

  // Effect to fetch content when the active tab or profile data changes
  useEffect(() => {
    if (profileData?.uid) {
      const canView = !profileData.isPrivate || followStatus === "following" || followStatus === "self";
      if (canView) {
        fetchUserContent(activeTab, true);
      } else {
        setUserData([]);
        setLoadingContent(false);
      }
    }
  }, [activeTab, profileData, followStatus]);

  const handleFollowAction = async () => {
    const previousFollowStatus = followStatus;
    const isPrivate = profileData?.isPrivate;

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

      setFollowStatus(response.data.status || "none");
      showToast(response.data.message, "success");

      const updatedProfileRes = await axios.get(
        `${apiBaseUrl}/api/users/profile/${username}`,
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );
      setProfileData(updatedProfileRes.data.profile);
    } catch (err) {
      console.error("Takip işlemi hatası:", err.response ? err.response.data : err.message);
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
    showToast("Kullanıcı engellendi.", "success");
    setShowDropdown(false);
  };

  const handleReportUser = async () => {
    showToast("Kullanıcı şikayet edildi.", "success");
    setShowDropdown(false);
  };

  const handleFeedback = () => {
    showToast("Geri bildirim sayfanız açıldı.", "info");
    setShowDropdown(false);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleStatClick = (type) => {
    if (profileData.isPrivate && followStatus !== "following" && followStatus !== "self") {
      showToast("Gizli bir hesabın takipçi listesini göremezsiniz.", "error");
    } else {
      setModalType(type);
      setShowModal(true);
    }
  };

  const handleVideoClick = (videoData) => {
    if (videoData && videoData.mediaUrl) {
      setSelectedVideo(videoData);
      setShowVideoModal(true);
    } else {
      console.error("Geçersiz video verisi:", videoData);
    }
  };

  const handleCloseVideoModal = () => {
    setShowVideoModal(false);
    setSelectedVideo(null);
  };

  const emptyMessage = () => {
    switch (activeTab) {
      case "posts":
        return `${profileData.displayName || profileData.username}, henüz bir gönderi paylaşmadı.`;
      case "feelings":
        return `${profileData.displayName || profileData.username}, henüz bir duygu paylaşmadı.`;
      case "feeds":
        return `${profileData.displayName || profileData.username}, henüz feed'leri bulunmamaktadır.`;
      case "likes":
        return `${profileData.displayName || profileData.username}, henüz bir gönderiyi beğenmedi.`;
      case "tags":
        return `${profileData.displayName || profileData.username}, henüz etiketlendiği bir gönderi bulunmamaktadır.`;
      default:
        return `Henüz bir içerik bulunmamaktadır.`;
    }
  };

  const getCardComponent = (item) => {
    switch (activeTab) {
      case "posts":
        return <PostCard key={item.id} post={item} />;
      case "feelings":
        return <TweetCard key={item.id} feeling={item} />;
      case "feeds":
        return (
          <VideoThumbnail
            key={item.id}
            mediaUrl={item.mediaUrl}
            onClick={() => handleVideoClick(item)}
          />
        );
      default:
        return null;
    }
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
            <strong>{contentCounts.posts + contentCounts.feeds + contentCounts.feelings}</strong>
            <span className={styles.statLabel}>Post</span>
          </div>
          <div className={styles.statBox}>
            <strong>{stats?.rta || 0}</strong>
            <span className={styles.statLabel}>RTA</span>
          </div>
          <div
            className={styles.statBox}
            onClick={() => handleStatClick("followers")}
          >
            <strong>{stats?.followers || 0}</strong>
            <span className={styles.statLabel}>Takipçi</span>
          </div>
          <div
            className={styles.statBox}
            onClick={() => handleStatClick("following")}
          >
            <strong>{stats?.following || 0}</strong>
            <span className={styles.statLabel}>Takip Edilen</span>
          </div>
        </div>
      </div>

      <div className={styles.tabBar}>
        <button
          className={activeTab === "posts" ? styles.active : ""}
          onClick={() => setActiveTab("posts")}
        >
          Posts
        </button>
        <button
          className={activeTab === "feeds" ? styles.active : ""}
          onClick={() => setActiveTab("feeds")}
        >
          Feeds
        </button>
        <button
          className={activeTab === "feelings" ? styles.active : ""}
          onClick={() => setActiveTab("feelings")}
        >
          Feelings
        </button>
        <button
          className={activeTab === "likes" ? styles.active : ""}
          onClick={() => setActiveTab("likes")}
          disabled={!canViewContent}
        >
          Beğenilenler
        </button>
        <button
          className={activeTab === "tags" ? styles.active : ""}
          onClick={() => setActiveTab("tags")}
          disabled={!canViewContent}
        >
          Etiketliler
        </button>
      </div>

      <div className={styles.tabContent}>
        {!canViewContent ? (
          <div className={styles.private_message}>
            <FaLock className={styles.privateAccountIcon} />
            <h3>Bu hesap gizlidir.</h3>
            <p>İçeriği görmek için takip etmelisiniz.</p>
          </div>
        ) : loadingContent ? (
          <LoadingOverlay />
        ) : userData.length > 0 ? (
          <div className={`${styles.section} ${activeTab === "feeds" ? styles.feedsGrid : ""}`}>
            {userData.map(getCardComponent)}
            {hasMore && (
              <div className={styles.loadMoreContainer}>
                <button
                  onClick={() => fetchUserContent(activeTab, false)}
                  className={styles.loadMoreBtn}
                  disabled={loadingContent}
                >
                  {loadingContent ? "Yükleniyor..." : "Daha Fazla Yükle"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.emptyState}>{emptyMessage()}</div>
        )}
      </div>

      {showModal && profileData && (
        <ConnectionsModal
          show={showModal}
          onClose={() => setShowModal(false)}
          listType={modalType}
          currentUserId={profileData.uid}
        />
      )}

      {showVideoModal && selectedVideo && (
        <div className={styles.videoModalOverlay} onClick={handleCloseVideoModal}>
          <div className={styles.videoModalContent} onClick={(e) => e.stopPropagation()}>
            <VideoFeedItem
              videoSrc={selectedVideo.mediaUrl}
              description={selectedVideo.content}
              username={selectedVideo.username}
              userProfileImage={selectedVideo.userProfileImage}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;