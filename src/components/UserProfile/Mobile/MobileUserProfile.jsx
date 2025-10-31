import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import styles from "./MobileUserProfile.module.css";
import { useAuth } from "../../../context/AuthProvider";
import LoadingOverlay from "../../LoadingOverlay/LoadingOverlay";
import ConnectionsModal from "../../ConnectionsModal/ConnectionsModal";
import { db } from "../../../config/firebase-client";
import {
  collection,
  query,
  getDocs,
  orderBy,
  limit,
  startAfter,
  where,
  doc,
  getDoc,
} from "firebase/firestore";

// Yeni İçerik Bileşenlerini Import Etme
import PostCard from "../../Post/PostCard";
import TweetCard from "../../TweetCard/TweetCard";
import VideoThumbnail from "../../AccountPage/Box/VideoThumbnail/VideoThumbnail";
import FeedVideoCard from "../../Feeds/FeedVideoCard/FeedVideoCard";
import PostThumbnail from "../../AccountPage/Box/PostThumbnail/PostThumbnail";

import {
  FaUserPlus,
  FaUserMinus,
  FaUserTimes,
  FaLock,
  FaBan, // ✅ YENİ: Engelleme ikonu eklendi
  // FaEllipsisV, FaCommentDots kaldırıldı
} from "react-icons/fa";
import { IoIosSettings } from "react-icons/io";
import axios from "axios";
import Footer from "../../Footer/Footer";

// Constants
const ITEMS_PER_PAGE = 10;

const MobileUserProfile = () => {
  const { username } = useParams();
  const { currentUser, showToast } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("posts");
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
  const [lastVisible, setLastVisible] = useState({});
  const [hasMore, setHasMore] = useState({});
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // ✅ YENİ: İşlem durumları eklendi
  const [isFollowProcessing, setIsFollowProcessing] = useState(false);
  const [isBlockProcessing, setIsBlockProcessing] = useState(false);

  const [contentCounts, setContentCounts] = useState({
    posts: 0,
    feeds: 0,
    feelings: 0,
    likes: 0,
    tags: 0,
  });

  const apiBaseUrl = process.env.REACT_APP_API_URL;

  // Function to fetch the user's content (posts, feeds, etc.)
  const fetchUserContent = async (type, isInitialLoad = true) => {
    // ✅ GÜNCELLENDİ: Engelleme durumunda içerik çekmeyi durdur
    if (!profileData?.uid) return;
    if (followStatus === "blocking" || followStatus === "blocked_by") {
      setLoadingContent((prev) => ({ ...prev, [type]: false }));
      setAllData((prev) => ({ ...prev, [type]: [] }));
      return;
    }

    setLoadingContent((prev) => ({ ...prev, [type]: true }));

    try {
      let collectionName;
      let userFilterField = "uid";

      switch (type) {
        case "feelings":
          collectionName = "globalFeelings";
          break;
        case "posts":
          collectionName = "globalPosts";
          break;
        case "feeds":
          collectionName = "globalFeeds";
          userFilterField = "ownerId";
          break;
        case "likes":
        case "tags":
          collectionName = `users/${profileData.uid}/${type}`;
          userFilterField = null;
          break;
        default:
          setLoadingContent((prev) => ({ ...prev, [type]: false }));
          return;
      }

      let queryRef = collection(db, collectionName);

      if (userFilterField) {
        queryRef = query(
          queryRef,
          where(userFilterField, "==", profileData.uid),
          orderBy("createdAt", "desc")
        );
      } else {
        queryRef = query(queryRef, orderBy("createdAt", "desc"));
      }

      const q = query(
        queryRef,
        ...(isInitialLoad
          ? [limit(ITEMS_PER_PAGE)]
          : [startAfter(lastVisible[type]), limit(ITEMS_PER_PAGE)])
      );

      if (!isInitialLoad && !lastVisible[type]) {
        setLoadingContent((prev) => ({ ...prev, [type]: false }));
        setHasMore((prev) => ({ ...prev, [type]: false }));
        return;
      }

      const querySnapshot = await getDocs(q);
      const fetchedData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      let contentData = [];
      if (type === "likes" || type === "tags") {
        for (const item of fetchedData) {
          const postRef = doc(db, item.postType, item.postId);
          const postSnap = await getDoc(postRef);
          if (postSnap.exists()) {
            contentData.push({
              id: postSnap.id,
              ...postSnap.data(),
              originalType: item.postType,
            });
          }
        }
      } else {
        contentData = fetchedData;
      }

      let filteredData = contentData;
      if (type === "feeds") {
        filteredData = contentData.filter((item) => item.mediaUrl);
      }

      setAllData((prevData) => {
        const newData = filteredData.filter(
          (item) =>
            !prevData[type].some((existingItem) => existingItem.id === item.id)
        );
        return { ...prevData, [type]: [...prevData[type], ...newData] };
      });

      setLastVisible((prev) => ({
        ...prev,
        [type]: querySnapshot.docs[querySnapshot.docs.length - 1],
      }));
      setHasMore((prev) => ({
        ...prev,
        [type]: fetchedData.length === ITEMS_PER_PAGE,
      }));
    } catch (error) {
      console.error("Veri çekme hatası:", error);
      showToast("İçerik yüklenirken bir hata oluştu.", "error");
    } finally {
      setLoadingContent((prev) => ({ ...prev, [type]: false }));
    }
  };

  const fetchContentCounts = async (profileUid) => {
    // ✅ GÜNCELLENDİ: Engelleme durumunda sayım yapmayı durdur
    if (
      !profileUid ||
      followStatus === "blocking" ||
      followStatus === "blocked_by"
    )
      return;
    try {
      const postsCountQuery = query(
        collection(db, `globalPosts`),
        where("uid", "==", profileUid)
      );
      const feelingsCountQuery = query(
        collection(db, `globalFeelings`),
        where("uid", "==", profileUid)
      );
      const feedsCountQuery = query(
        collection(db, `globalFeeds`),
        where("ownerId", "==", profileUid)
      );
      const likesCountQuery = query(
        collection(db, `users/${profileUid}/likes`)
      );
      const tagsCountQuery = query(collection(db, `users/${profileUid}/tags`));

      const [
        postsSnapshot,
        feelingsSnapshot,
        feedsSnapshot,
        likesSnapshot,
        tagsSnapshot,
      ] = await Promise.all([
        getDocs(postsCountQuery),
        getDocs(feelingsCountQuery),
        getDocs(feedsCountQuery),
        getDocs(likesCountQuery),
        getDocs(tagsCountQuery),
      ]);

      setContentCounts({
        posts: postsSnapshot.size,
        feelings: feelingsSnapshot.size,
        feeds: feedsSnapshot.size,
        likes: likesSnapshot.size,
        tags: tagsSnapshot.size,
      });
    } catch (error) {
      console.error("Koleksiyon sayıları çekme hatası:", error);
      setContentCounts({
        posts: 0,
        feeds: 0,
        feelings: 0,
        likes: 0,
        tags: 0,
      });
    }
  };

  useEffect(() => {
    // ✅ GÜNCELLENDİ: Profil ve Durum Çekme
    const fetchUserProfileAndStatus = async () => {
      setLoading(true);
      setError(null);
      setProfileData(null); // Temizle
      setFollowStatus("none"); // Sıfırla
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

        let status = "none";
        if (profile.uid === currentUser.uid) {
          status = "self";
        } else {
          const statusRes = await axios.get(
            `${apiBaseUrl}/api/users/profile/${profile.uid}/status`,
            {
              headers: { Authorization: `Bearer ${idToken}` },
            }
          );
          status = statusRes.data.followStatus;
        }
        setFollowStatus(status); // ✅ 'blocking' ve 'blocked_by' dahil

        const canView =
          !profile.isPrivate || status === "following" || status === "self";

        // ✅ GÜNCELLENDİ: Engelleme durumunda sayım yapma
        if (canView && status !== "blocking" && status !== "blocked_by") {
          fetchContentCounts(profile.uid);
        } else {
          setContentCounts({
            posts: 0,
            feeds: 0,
            feelings: 0,
            likes: 0,
            tags: 0,
          });
        }
      } catch (err) {
        console.error("Profil veya takip durumu çekme hatası:", err);
        // ✅ GÜNCELLENDİ: Hata yönetimi
        if (err.response && err.response.status === 404) {
          setError("Kullanıcı bulunamadı.");
        } else {
          setError("Profil bilgileri yüklenemedi.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (username && currentUser) {
      fetchUserProfileAndStatus();
    }
  }, [username, currentUser, apiBaseUrl]);

  useEffect(() => {
    if (profileData?.uid) {
      const canView =
        !profileData.isPrivate ||
        followStatus === "following" ||
        followStatus === "self";

      // ✅ GÜNCELLENDİ: Engelleme durumunda içerik çekme
      if (
        canView &&
        followStatus !== "blocking" &&
        followStatus !== "blocked_by"
      ) {
        if (allData[activeTab].length === 0) {
          fetchUserContent(activeTab, true);
        }
      } else {
        setAllData({
          posts: [],
          feelings: [],
          feeds: [],
          likes: [],
          tags: [],
        });
        setLoadingContent({});
      }
    }
  }, [activeTab, profileData, followStatus]);

  // ✅ GÜNCELLENDİ: Takip Fonksiyonu (Daha verimli)
  const handleFollowAction = async () => {
    if (!profileData?.uid || isFollowProcessing) return;
    setIsFollowProcessing(true);

    const previousFollowStatus = followStatus;
    const isPrivate = profileData?.isPrivate;

    try {
      const idToken = await currentUser.getIdToken();
      if (!idToken) throw new Error("Kimlik doğrulama belirteci mevcut değil.");

      let endpoint;
      let method;
      let bodyData = {};

      switch (previousFollowStatus) {
        case "none":
          endpoint = `${apiBaseUrl}/api/users/follow`;
          method = "POST";
          bodyData = { targetUid: profileData.uid };
          break;
        case "pending":
          endpoint = `${apiBaseUrl}/api/users/follow/request/retract/${profileData.uid}`;
          method = "DELETE";
          break;
        case "following":
          endpoint = `${apiBaseUrl}/api/users/unfollow/${profileData.uid}`;
          method = "DELETE";
          break;
        default:
          setIsFollowProcessing(false);
          return;
      }

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
        response = await axios.post(endpoint, bodyData, { headers });
      } else {
        response = await axios.delete(endpoint, { headers });
      }

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
      setFollowStatus(previousFollowStatus);
      const errorMsg = err.response?.data?.error || "Takip işlemi başarısız.";
      showToast(errorMsg, "error");
    } finally {
      setIsFollowProcessing(false);
    }
  };

  // ✅ YENİ: Engelleme/Engeli Kaldırma Fonksiyonu
  const handleBlockAction = async () => {
    if (!profileData?.uid || isBlockProcessing) return;
    setIsBlockProcessing(true);

    const previousFollowStatus = followStatus;
    const targetUid = profileData.uid;

    try {
      const idToken = await currentUser.getIdToken();
      if (!idToken) throw new Error("Kimlik doğrulama belirteci mevcut değil.");
      const headers = { Authorization: `Bearer ${idToken}` };

      let response;
      let newStatus;

      if (followStatus === "blocking") {
        // Engeli Kaldır
        response = await axios.delete(
          `${apiBaseUrl}/api/users/unblock/${targetUid}`,
          { headers }
        );
        newStatus = "none"; // Engel kalkınca 'none' durumuna döner
        showToast("Kullanıcının engeli kaldırıldı.", "success");
      } else {
        // Engelle
        const confirmBlock = window.confirm(
          "Bu kullanıcıyı engellemek istediğinizden emin misiniz? Engellenen kullanıcılar profilinizi göremez, sizi takip edemez veya size mesaj gönderemez."
        );
        if (!confirmBlock) {
          setIsBlockProcessing(false);
          return;
        }

        response = await axios.post(
          `${apiBaseUrl}/api/users/block/${targetUid}`,
          {},
          { headers }
        );
        newStatus = "blocking";
        showToast("Kullanıcı engellendi.", "success");
      }

      setFollowStatus(response.data.status || newStatus);

      // Engelleme/takibi bırakma sonrası istatistikler değişebilir
      if (response.data.newStats) {
        setProfileData((prev) => ({
          ...prev,
          stats: response.data.newStats,
        }));
      }
    } catch (err) {
      console.error(
        "Engelleme işlemi hatası:",
        err.response?.data || err.message
      );
      setFollowStatus(previousFollowStatus);
      const errorMsg = err.response?.data?.error || "İşlem başarısız.";
      showToast(errorMsg, "error");
    } finally {
      setIsBlockProcessing(false);
    }
  };

  // ❌ KALDIRILDI: handleMessageAction
  // const handleMessageAction = async () => { ... };

  // ✅ GÜNCELLENDİ: StatClick (Engelleme kontrolü eklendi)
  const handleStatClick = (type) => {
    if (followStatus === "blocking" || followStatus === "blocked_by") {
      return;
    }

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

  // ... (handleVideoClick, handleCloseVideoModal, handlePostClick, handleClosePostModal fonksiyonları aynı)
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

  const handlePostClick = (postData) => {
    if (postData && postData.id) {
      const postWithStatus = { ...postData, followStatus: followStatus };
      setSelectedPost(postWithStatus);
      setShowPostModal(true);
    } else {
      console.error("Geçersiz gönderi verisi:", postData);
    }
  };

  const handleClosePostModal = () => {
    setShowPostModal(false);
    setSelectedPost(null);
  };

  // ... (getCardComponent ve emptyMessage fonksiyonları aynı)
  const getCardComponent = (item) => {
    const type = item.originalType || activeTab;

    switch (type) {
      case "globalPosts":
      case "posts":
      case "likes":
      case "tags":
        return (
          <PostThumbnail key={item.id} data={item} onClick={handlePostClick} />
        );
      case "globalFeelings":
      case "feelings":
        return <TweetCard key={item.id} data={item} />;
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

  const emptyMessage = () => {
    // ... (bu fonksiyon değişmedi)
    switch (activeTab) {
      case "posts":
        return `${
          profileData.displayName || profileData.username
        }, henüz bir gönderi paylaşmadı.`;
      // ... diğer case'ler
      default:
        return `Henüz bir içerik bulunmamaktadır.`;
    }
  };

  if (loading) {
    return <LoadingOverlay />;
  }

  // ✅ GÜNCELLENDİ: Hata ekranı
  if (error) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.username}>{username}</div>
        </header>
        <div className={styles.private_message} style={{ paddingTop: "50px" }}>
          <FaBan className={styles.privateAccountIcon} />
          <h3>{error}</h3>
          <p>Lütfen daha sonra tekrar deneyin veya ana sayfaya dönün.</p>
        </div>
      </div>
    );
  }

  // ✅ YENİ: Engellendi (blocked_by) ekranı
  if (followStatus === "blocked_by") {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.username}>{username}</div>
        </header>
        <div className={styles.private_message} style={{ paddingTop: "50px" }}>
          <FaLock className={styles.privateAccountIcon} />
          <h3>Kullanıcı bulunamadı</h3>
          <p>Bu hesabı görme yetkiniz bulunmamaktadır.</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return <div>Kullanıcı profili bulunamadı.</div>; // Fallback
  }

  // ✅ GÜNCELLENDİ: canViewContent (Engelleme kontrolü)
  const canViewContent =
    !profileData.isPrivate ||
    followStatus === "following" ||
    followStatus === "self";

  const { displayName, photoURL, bio, familySystem, stats } = profileData;

  // ✅ GÜNCELLENDİ: Takip Butonu (Engelleme kontrolü)
  const renderFollowButton = () => {
    switch (followStatus) {
      case "self":
      case "blocking": // Engelliyorsan gösterme
      case "blocked_by": // Engellendiysen gösterme
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

  // ✅ YENİ: Engelleme Butonu Render Fonksiyonu
  const renderBlockButton = () => {
    switch (followStatus) {
      case "self":
      case "blocked_by": // Engellendiysen gösterme
        return null;
      case "blocking":
        return (
          <button
            onClick={handleBlockAction}
            className={`${styles.unfollowBtn} ${styles.actionButton}`} // Gri stil
            disabled={isBlockProcessing}
          >
            <FaUserPlus /> Engeli Kaldır
          </button>
        );
      case "none":
      case "pending":
      case "following":
      default:
        return (
          <button
            onClick={handleBlockAction}
            className={`${styles.blockBtn} ${styles.actionButton}`} // Kırmızı stil (CSS eklenmeli)
            disabled={isBlockProcessing}
          >
            <FaBan /> Engelle
          </button>
        );
    }
  };

  const tabs = [
    { key: "posts", label: "Posts" },
    { key: "feelings", label: "Feelings" },
    { key: "feeds", label: "Feeds" },
    /*  { key: "likes", label: "Beğenilenler", disabled: !canViewContent || followStatus === 'blocking' },
    { key: "tags", label: "Etiketliler", disabled: !canViewContent || followStatus === 'blocking' }, */
  ];

  // RTA ve toplam post sayısını hesapla
  const totalContentCount =
    contentCounts.posts + contentCounts.feeds + contentCounts.feelings;
  const rtaScore = stats?.rta || 0;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.username}>{username}</div>
        <div className={styles.actions}>
          {followStatus === "self" ? (
            <Link to="/settings" className={styles.actionBtn}>
              <IoIosSettings className={styles.icon} />
            </Link>
          ) : // ❌ KALDIRILDI: Dropdown butonu
          // <div className={styles.actionBtn}>
          //   <FaEllipsisV className={styles.icon} />
          // </div>
          null}
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
              <span className={styles.statNumber}>
                {/* ✅ GÜNCELLENDİ: Engelleme durumunda 0 göster */}
                {followStatus === "blocking" ? 0 : totalContentCount}
              </span>
              <span className={styles.statLabel}>Post</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>
                {followStatus === "blocking" ? 0 : rtaScore}
              </span>
              <span className={styles.statLabel}>RTA</span>
            </div>
          </div>
          <div className={styles.stat_content}>
            <div
              className={styles.stat}
              onClick={() => handleStatClick("followers")}
              style={{ cursor: "pointer" }}
            >
              <span className={styles.statNumber}>
                {followStatus === "blocking" ? 0 : stats?.followers || 0}
              </span>
              <span className={styles.statLabel}>Followers</span>
            </div>
            <div
              className={styles.stat}
              onClick={() => handleStatClick("following")}
              style={{ cursor: "pointer" }}
            >
              <span className={styles.statNumber}>
                {followStatus === "blocking" ? 0 : stats?.following || 0}
              </span>
              <span className={styles.statLabel}>Following</span>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ GÜNCELLENDİ: Engelleme durumunda bio'yu gizle */}
      {followStatus !== "blocking" && (
        <div className={styles.bioSection}>
          <h1 className={styles.name}>{displayName}</h1>
          {familySystem && <div className={styles.tag}>{familySystem}</div>}
          <p className={styles.bioText}>
            {bio || "Henüz bir biyografi eklemediniz."}
          </p>
        </div>
      )}

      {/* ✅ GÜNCELLENDİ: Aksiyon Butonları (Engelleme butonu eklendi) */}
      {followStatus !== "self" && (
        <div className={styles.actionButtons}>
          {renderFollowButton()}
          {renderBlockButton()}
          {/* ❌ KALDIRILDI: Mesaj butonu
          <button
            onClick={handleMessageAction}
            className={`${styles.messageBtn} ${styles.actionButton}`}
          >
            <FaCommentDots /> Mesaj
          </button>
          */}
        </div>
      )}

      {/* ✅ YENİ: Engellendi (blocking) ekranı */}
      {followStatus === "blocking" ? (
        <div className={styles.private_message} style={{ paddingTop: "20px" }}>
          <FaBan className={styles.privateAccountIcon} />
          <h3>Bu hesabı engellediniz.</h3>
          <p>
            Bu kullanıcının gönderilerini veya profilini göremezsiniz. Engeli
            kaldırmak için yukarıdaki butonu kullanın.
          </p>
        </div>
      ) : (
        <>
          {/* Profilin geri kalanı (eğer engellenmediyse) */}
          <div className={styles.tabs}>
            {tabs.map(({ key, label, disabled }) => (
              <button
                key={key}
                className={`${styles.tab} ${
                  activeTab === key ? styles.activeTab : ""
                }`}
                onClick={() => setActiveTab(key)}
                disabled={disabled}
              >
                {label}
              </button>
            ))}
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
            ) : allData[activeTab].length > 0 ? (
              <div
                className={
                  activeTab === "feelings"
                    ? styles.feelingsGrid
                    : activeTab === "feeds"
                    ? styles.feedsGrid
                    : styles.postsGrid
                }
              >
                {allData[activeTab].map(getCardComponent)}
                {hasMore[activeTab] && (
                  <div className={styles.loadMoreContainer}>
                    <button
                      onClick={() => fetchUserContent(activeTab, false)}
                      className={styles.loadMoreBtn}
                      disabled={loadingContent[activeTab]}
                    >
                      {loadingContent[activeTab]
                        ? "Yükleniyor..."
                        : "Daha Fazla Yükle"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.emptyState}>{emptyMessage()}</div>
            )}
            <div className={styles.footerWrapper}>
              <Footer />
            </div>
          </div>
        </>
      )}

      {/* ... (Modallar değişmedi) ... */}
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
            <FeedVideoCard
              data={selectedVideo}
              onClose={handleCloseVideoModal}
              isMobile={true}
            />
          </div>
        </div>
      )}

      {showPostModal && selectedPost && (
        <div
          className={styles.videoModalOverlay}
          onClick={handleClosePostModal}
        >
          <div
            className={`${styles.videoModalContent} ${styles.postModalContent}`}
            onClick={(e) => e.stopPropagation()}
          >
            <PostCard
              data={selectedPost}
              followStatus={selectedPost.followStatus || "none"}
            />
            <button
              className={styles.closePostModalButton}
              onClick={handleClosePostModal}
            >
              X
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileUserProfile;
