import React, { useState, useEffect, useRef } from "react";
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
import { collection, query, getDocs, orderBy, where } from "firebase/firestore";

// Importing the content components
import PostCard from "../AccountPage/Box/PostBox/PostBox";
import TweetCard from "../AccountPage/Box/FeelingsBox/FeelingsBox";
import VideoThumbnail from "../AccountPage/Box/VideoFeedItem/VideoThumbnail/VideoThumbnail";
import VideoFeedItem from "../AccountPage/Box/VideoFeedItem/VideoFeedItem";

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
  const [allData, setAllData] = useState({
    posts: [],
    feelings: [],
    feeds: [],
    likes: [],
    tags: [],
  });
  const [loadingContent, setLoadingContent] = useState({});
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isFollowProcessing, setIsFollowProcessing] = useState(false);

  const apiBaseUrl = process.env.REACT_APP_API_URL;
  const idTokenRef = useRef(null);
  const cachedLikedIdsRef = useRef([]);
  const cachedSavedIdsRef = useRef([]);

  const inflightRequests = useRef(new Map());

  const axiosInstance = useRef(axios.create({ baseURL: apiBaseUrl }));

  const dedupedFetch = async (key, fetcher) => {
    if (inflightRequests.current.has(key)) {
      return inflightRequests.current.get(key);
    }
    const promise = fetcher();
    inflightRequests.current.set(key, promise);
    try {
      const result = await promise;
      return result;
    } finally {
      inflightRequests.current.delete(key);
    }
  };

  useEffect(() => {
    let mounted = true;
    if (!currentUser) {
      idTokenRef.current = null;
      return;
    }
    const fetchToken = async () => {
      try {
        const t = await currentUser.getIdToken();
        if (mounted) {
          idTokenRef.current = t;
        }
      } catch (err) {
        console.error("Token alınamadı:", err);
      }
    };
    fetchToken();
    return () => {
      mounted = false;
    };
  }, [currentUser]);

  // Yeni ve daha sağlam profil çekme mantığı
  useEffect(() => {
    let mounted = true;
    console.log("API BASE URL:", apiBaseUrl);
    const fetchProfileAndStatus = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Her zaman herkese açık olan profil verilerini çek
        // Bu çağrı artık stats verilerini de getirecek
        const profileRes = await dedupedFetch(`profile/${username}`, () =>
          axiosInstance.current.get(`/api/users/profile/${username}`)
        );

        if (!mounted) return;
        const profile = profileRes.data.profile;

        // 2. Eğer kullanıcı giriş yapmışsa, takip durumunu çek
        let currentFollowStatus = "none";
        if (currentUser) {
          const idToken = await currentUser.getIdToken();
          if (!mounted) return;
          if (profile.uid === currentUser.uid) {
            currentFollowStatus = "self";
          } else {
            const headers = { Authorization: `Bearer ${idToken}` };
            const statusRes = await dedupedFetch(`status/${profile.uid}`, () =>
              axiosInstance.current.get(
                `/api/users/profile/${profile.uid}/status`,
                { headers }
              )
            );
            if (!mounted) return;
            currentFollowStatus = statusRes.data.followStatus;
          }
        }

        if (mounted) {
          setFollowStatus(currentFollowStatus);
          setProfileData(profile); // Tüm veriler zaten profile nesnesinin içinde
        }
      } catch (err) {
        console.error(
          "Profil veya takip durumu çekme hatası:",
          err.response?.data || err.message
        );
        setError("Profil bilgileri yüklenemedi.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (username) {
      fetchProfileAndStatus();
    }
    return () => {
      mounted = false;
    };
  }, [username, currentUser]);

  // ---------------- FETCH AND CACHE LIKES/TAGS IDs ONCE ----------------
  useEffect(() => {
    let mounted = true;
    if (!profileData?.uid) return;
    const fetchLikesAndTags = async () => {
      try {
        const [likesSnapshot, tagsSnapshot] = await Promise.all([
          getDocs(collection(db, "users", profileData.uid, "likes")),
          getDocs(collection(db, "users", profileData.uid, "tags")),
        ]);
        if (!mounted) return;
        cachedLikedIdsRef.current = likesSnapshot.docs.map((doc) => doc.id);
        cachedSavedIdsRef.current = tagsSnapshot.docs.map((doc) => doc.id);
      } catch (e) {
        console.error("Beğenilenler/etiketliler çekme hatası:", e);
      }
    };
    fetchLikesAndTags();
    return () => {
      mounted = false;
    };
  }, [profileData?.uid]);

  // Helper function to chunk large arrays for Firestore `in` queries (limit 10)
  const chunkArray = (arr, size) => {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  };

  // Helper function to fetch posts by IDs with chunking
  const fetchPostsByIds = async (ids) => {
    if (!ids || ids.length === 0) return [];
    const chunks = chunkArray(ids, 10);
    const snapshots = await Promise.all(
      chunks.map((chunk) =>
        getDocs(
          query(collection(db, "globalPosts"), where("__name__", "in", chunk))
        )
      )
    );
    const items = snapshots.flatMap((snap) =>
      snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    );
    return items;
  };

  // ---------------- FETCH DATA BASED ON ACTIVE TAB ----------------
  useEffect(() => {
    let mounted = true;
    const fetchTabData = async () => {
      if (!profileData || !profileData.uid) return;
      const canViewContent =
        !profileData.isPrivate ||
        followStatus === "following" ||
        followStatus === "self";
      if (
        !canViewContent &&
        !["posts", "feelings", "feeds"].includes(activeTab)
      )
        return;
      if (allData[activeTab]?.length > 0) return;

      setLoadingContent((prev) => ({ ...prev, [activeTab]: true }));
      try {
        const processSnapshot = (docs, type) => {
          const likedIds = cachedLikedIdsRef.current;
          const savedIds = cachedSavedIdsRef.current;
          let data = docs.map((item) => ({
            id: item.id,
            ...item,
            initialLiked: likedIds.includes(item.id),
            initialSaved: savedIds.includes(item.id),
          }));
          if (type === "feeds") {
            data = data.filter((item) => item.mediaUrl);
          }
          return data;
        };

        switch (activeTab) {
          case "posts": {
            const q = query(
              collection(db, "globalPosts"),
              where("uid", "==", profileData.uid),
              orderBy("createdAt", "desc")
            );
            const snapshot = await getDocs(q);
            if (!mounted) return;
            setAllData((prev) => ({
              ...prev,
              [activeTab]: processSnapshot(
                snapshot.docs.map((d) => ({ id: d.id, ...d.data() })),
                activeTab
              ),
            }));
            break;
          }
          case "feelings": {
            const q = query(
              collection(db, "globalFeelings"),
              where("uid", "==", profileData.uid),
              orderBy("createdAt", "desc")
            );
            const snapshot = await getDocs(q);
            if (!mounted) return;
            setAllData((prev) => ({
              ...prev,
              [activeTab]: processSnapshot(
                snapshot.docs.map((d) => ({ id: d.id, ...d.data() })),
                activeTab
              ),
            }));
            break;
          }
          case "feeds": {
            const q = query(
              collection(db, "globalFeeds"),
              where("ownerId", "==", profileData.uid),
              orderBy("createdAt", "desc")
            );
            const snapshot = await getDocs(q);
            if (!mounted) return;
            setAllData((prev) => ({
              ...prev,
              [activeTab]: processSnapshot(
                snapshot.docs.map((d) => ({ id: d.id, ...d.data() })),
                activeTab
              ),
            }));
            break;
          }
          case "likes": {
            const likedIds = cachedLikedIdsRef.current;
            const likedPosts = await fetchPostsByIds(likedIds);
            if (!mounted) return;
            setAllData((prev) => ({
              ...prev,
              [activeTab]: processSnapshot(likedPosts, activeTab),
            }));
            break;
          }
          case "tags": {
            const savedIds = cachedSavedIdsRef.current;
            const taggedPosts = await fetchPostsByIds(savedIds);
            if (!mounted) return;
            setAllData((prev) => ({
              ...prev,
              [activeTab]: processSnapshot(taggedPosts, activeTab),
            }));
            break;
          }
          default:
            if (mounted) setAllData((prev) => ({ ...prev, [activeTab]: [] }));
            break;
        }
      } catch (error) {
        console.error(`Veri çekilirken hata oluştu (${activeTab}):`, error);
        const errorMessage =
          error.code === "failed-precondition"
            ? "Dizin hatası: İçerikleri görüntülemek için Firebase'de gerekli dizinlerin oluşturulması gerekiyor. Lütfen konsolu kontrol edin."
            : "Veriler yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.";
        showToast(errorMessage, "error");
      } finally {
        if (mounted)
          setLoadingContent((prev) => ({ ...prev, [activeTab]: false }));
      }
    };

    if (
      profileData &&
      (followStatus === "following" ||
        followStatus === "self" ||
        !profileData.isPrivate)
    ) {
      fetchTabData();
    }
    return () => {
      mounted = false;
    };
  }, [activeTab, profileData, followStatus]);

  const handleTabChange = (tab) => {
    if (activeTab === tab) return;
    setActiveTab(tab);
  };

  const handleFollowAction = async () => {
    if (!profileData?.uid || isFollowProcessing) return;
    setIsFollowProcessing(true);

    const previousFollowStatus = followStatus;
    const isPrivate = profileData?.isPrivate;

    try {
      const idToken = idTokenRef.current;
      if (!idToken) throw new Error("Kimlik doğrulama belirteci mevcut değil.");

      let endpoint;
      let method;
      let bodyData = {};

      switch (previousFollowStatus) {
        case "none":
          endpoint = `/api/users/follow`;
          method = "POST";
          bodyData = { targetUid: profileData.uid };
          break;
        case "pending":
          endpoint = `/api/users/follow/request/retract/${profileData.uid}`;
          method = "DELETE";
          break;
        case "following":
          endpoint = `/api/users/unfollow/${profileData.uid}`;
          method = "DELETE";
          break;
        default:
          setIsFollowProcessing(false);
          return;
      }

      // Optimistic UI update
      setFollowStatus((prev) => {
        if (prev === "none") return isPrivate ? "pending" : "following";
        return "none";
      });

      const headers = {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      };
      let response;

      if (method === "POST") {
        response = await axiosInstance.current.post(endpoint, bodyData, {
          headers,
        });
      } else {
        response = await axiosInstance.current.delete(endpoint, { headers });
      }

      // API yanıtına göre güncelle
      setFollowStatus(response.data.status || "none");

      if (response.data.newStats) {
        setProfileData((prev) => ({
          ...prev,
          stats: response.data.newStats,
        }));
      }

      showToast(response.data.message, "success");
    } catch (err) {
      console.error("Takip işlemi hatası:", err.response?.data || err.message);
      setFollowStatus(previousFollowStatus); // Hata durumunda eski durumu geri al
      const errorMsg = err.response?.data?.error || "Takip işlemi başarısız.";
      showToast(errorMsg, "error");
    } finally {
      setIsFollowProcessing(false);
    }
  };

  const handleMessageAction = async () => {
    const messageContent = prompt("Göndermek istediğiniz mesajı yazın:");
    if (!messageContent) return;
    try {
      const idToken = idTokenRef.current;
      const headers = idToken
        ? {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          }
        : { "Content-Type": "application/json" };
      const response = await axiosInstance.current.post(
        `/api/users/message`,
        { targetUid: profileData.uid, messageContent },
        { headers }
      );
      showToast(response.data.message, "success");
    } catch (err) {
      console.error(
        "Mesaj gönderme hatası:",
        err.response?.data || err.message
      );
      const errorMsg = err.response?.data?.error || "Mesaj gönderme başarısız.";
      showToast(errorMsg, "error");
    }
  };

  const handleBlockUser = () => {
    showToast("Kullanıcı engellendi.", "success");
    setShowDropdown(false);
  };

  const handleReportUser = () => {
    showToast("Kullanıcı şikayet edildi.", "success");
    setShowDropdown(false);
  };

  const handleFeedback = () => {
    showToast("Geri bildirim sayfanız açıldı.", "info");
    setShowDropdown(false);
  };

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  const handleStatClick = (type) => {
    if (
      profileData.isPrivate &&
      followStatus !== "following" &&
      followStatus !== "self"
    ) {
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
    }
  };

  const handleCloseVideoModal = () => {
    setShowVideoModal(false);
    setSelectedVideo(null);
  };

  const emptyMessage = () => {
    switch (activeTab) {
      case "posts":
        return `${
          profileData.displayName || profileData.username
        }, henüz bir gönderi paylaşmadı.`;
      case "feelings":
        return `${
          profileData.displayName || profileData.username
        }, henüz bir duygu paylaşmadı.`;
      case "feeds":
        return `${
          profileData.displayName || profileData.username
        }, henüz feed'leri bulunmamaktadır.`;
      case "likes":
        return `${
          profileData.displayName || profileData.username
        }, henüz bir gönderiyi beğenmedi.`;
      case "tags":
        return `${
          profileData.displayName || profileData.username
        }, henüz etiketlendiği bir gönderi bulunmamaktadır.`;
      default:
        return `Henüz bir içerik bulunmamaktadır.`;
    }
  };

  const getCardComponent = (item) => {
    const type = item.originalType || activeTab;
    switch (type) {
      case "globalPosts":
      case "posts":
      case "likes":
      case "tags":
        return <PostCard key={item.id} post={item} />;
      case "globalFeelings":
      case "feelings":
        return <TweetCard key={item.id} feeling={item} />;
      case "globalFeeds":
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
    !profileData.isPrivate ||
    followStatus === "following" ||
    followStatus === "self";
  const { displayName, photoURL, bio, familySystem } = profileData;
  const currentContent = allData[activeTab] || [];
  const totalContentCount =
    (profileData.stats?.posts || 0) +
    (profileData.stats?.feeds || 0) +
    (profileData.stats?.feelings || 0);

  const renderFollowButton = () => {
    switch (followStatus) {
      case "self":
        return null;
      case "following":
        return (
          <button
            onClick={handleFollowAction}
            className={`${styles.unfollowBtn} ${styles.actionButton}`}
            disabled={isFollowProcessing}
          >
            <FaUserMinus /> Takibi Bırak
          </button>
        );
      case "pending":
        return (
          <button
            onClick={handleFollowAction}
            className={`${styles.pendingBtn} ${styles.actionButton}`}
            disabled={isFollowProcessing}
          >
            <FaUserTimes /> İstek Gönderildi
          </button>
        );
      case "none":
      default:
        return (
          <button
            onClick={handleFollowAction}
            className={`${styles.followBtn} ${styles.actionButton}`}
            disabled={isFollowProcessing}
          >
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
            <strong>{totalContentCount}</strong>
            <span className={styles.statLabel}>Post</span>
          </div>
          <div
            className={styles.statBox}
            onClick={() => handleStatClick("followers")}
          >
            <strong>{profileData.stats?.followers || 0}</strong>
            <span className={styles.statLabel}>Followers</span>
          </div>
          <div
            className={styles.statBox}
            onClick={() => handleStatClick("following")}
          >
            <strong>{profileData.stats?.following || 0}</strong>
            <span className={styles.statLabel}>Following</span>
          </div>
        </div>
      </div>

      <div className={styles.tabBar}>
        <button
          className={activeTab === "posts" ? styles.active : ""}
          onClick={() => handleTabChange("posts")}
        >
          Posts
        </button>
        <button
          className={activeTab === "feeds" ? styles.active : ""}
          onClick={() => handleTabChange("feeds")}
        >
          Feeds
        </button>
        <button
          className={activeTab === "feelings" ? styles.active : ""}
          onClick={() => handleTabChange("feelings")}
        >
          Feelings
        </button>
        <button
          className={activeTab === "likes" ? styles.active : ""}
          onClick={() => handleTabChange("likes")}
          disabled={!canViewContent}
        >
          Beğenilenler
        </button>
        <button
          className={activeTab === "tags" ? styles.active : ""}
          onClick={() => handleTabChange("tags")}
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
        ) : loadingContent[activeTab] ? (
          <LoadingOverlay />
        ) : currentContent.length > 0 ? (
          <div
            className={`${styles.section} ${
              activeTab === "feeds" ? styles.feedsGrid : ""
            }`}
          >
            {currentContent.map(getCardComponent)}
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
        <div
          className={styles.videoModalOverlay}
          onClick={handleCloseVideoModal}
        >
          <div
            className={styles.videoModalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <VideoFeedItem
              videoSrc={selectedVideo.mediaUrl}
              description={selectedVideo.content}
              username={selectedVideo.username}
              userProfileImage={selectedVideo.userProfileImage}
              feed={selectedVideo}
              onClose={handleCloseVideoModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
