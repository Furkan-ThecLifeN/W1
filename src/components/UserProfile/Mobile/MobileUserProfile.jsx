import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import styles from "./MobileUserProfile.module.css";
import { useAuth } from "../../../context/AuthProvider";
import LoadingOverlay from "../../LoadingOverlay/LoadingOverlay";
import ConnectionsModal from "../../ConnectionsModal/ConnectionsModal";
// ⛔️ Firebase importları kaldırıldı
// import { db } from "../../../config/firebase-client";
// import { ... } from "firebase/firestore";

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
  FaBan,
} from "react-icons/fa";
import { IoIosSettings } from "react-icons/io";
import axios from "axios";
import Footer from "../../Footer/Footer";

const MobileUserProfile = () => {
  const { username } = useParams();
  const { currentUser, showToast } = useAuth();
  const navigate = useNavigate(); // useNavigate eklendi (UserProfile'da vardı)
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
  // ⛔️ Pagination state'leri kaldırıldı
  // const [lastVisible, setLastVisible] = useState({});
  // const [hasMore, setHasMore] = useState({});
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const [isFollowProcessing, setIsFollowProcessing] = useState(false);
  const [isBlockProcessing, setIsBlockProcessing] = useState(false);

  // ⛔️ contentCounts state'i kaldırıldı

  const apiBaseUrl = process.env.REACT_APP_API_URL;

  // ✅ YENİ: UserProfile.jsx'ten eklenen Ref'ler
  const idTokenRef = useRef(null);
  const inflightRequests = useRef(new Map());
  const axiosInstance = useRef(axios.create({ baseURL: apiBaseUrl }));

  // ✅ YENİ: UserProfile.jsx'ten eklenen dedupedFetch
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

  // ✅ YENİ: UserProfile.jsx'ten eklenen idTokenRef useEffect'i
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

  // ⛔️ fetchUserContent fonksiyonu kaldırıldı
  // ⛔️ fetchContentCounts fonksiyonu kaldırıldı

  // ✅ GÜNCELLENDİ: fetchUserProfileAndStatus (UserProfile.jsx'teki mantıkla)
  useEffect(() => {
    let mounted = true;
    const fetchUserProfileAndStatus = async () => {
      setLoading(true);
      setError(null);
      setProfileData(null);
      setFollowStatus("none");

      try {
        const profileRes = await dedupedFetch(`profile/${username}`, () =>
          axiosInstance.current.get(`/api/users/profile/${username}`)
        );

        if (!mounted) return;
        const profile = profileRes.data.profile;
        setProfileData(profile); // Stats verisi artık burada geliyor

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
        }
      } catch (err) {
        console.error(
          "Profil veya takip durumu çekme hatası:",
          err.response?.data || err.message
        );
        if (err.response && err.response.status === 404) {
          setError("Kullanıcı bulunamadı.");
        } else {
          setError("Profil bilgileri yüklenemedi.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (username && currentUser) {
      fetchUserProfileAndStatus();
    } else if (!currentUser && username) {
      // Misafir kullanıcı için (tokensiz istek)
      fetchUserProfileAndStatus();
    }
  }, [username, currentUser]);

  // ✅✅✅ GÜNCELLENEN BÖLÜM BURASI ✅✅✅
  // Bu useEffect, artık Firestore'u değil,
  // 1. Adım'da oluşturduğunuz yeni API endpoint'ini çağıracak.
  useEffect(() => {
    let mounted = true;
    const fetchTabData = async () => {
      if (!profileData || !profileData.uid) return;

      // 1. Gizli profili ve engellenen profilleri kontrol et
      const canViewContent =
        !profileData.isPrivate ||
        followStatus === "following" ||
        followStatus === "self";

      if (
        followStatus === "blocking" ||
        followStatus === "blocked_by" ||
        !canViewContent
      ) {
        setLoadingContent((prev) => ({ ...prev, [activeTab]: false }));
        setAllData((prev) => ({ ...prev, [activeTab]: [] }));
        return;
      }

      // 2. 'likes' veya 'tags' sekmeleri (Yorum satırında olsalar da)
      if (
        !canViewContent &&
        profileData.isPrivate &&
        ["likes", "tags"].includes(activeTab)
      ) {
        setAllData((prev) => ({ ...prev, [activeTab]: [] }));
        return;
      }

      // 3. Bu tab için veri zaten çekildiyse tekrar çekme
      if (allData[activeTab]?.length > 0) return;

      setLoadingContent((prev) => ({ ...prev, [activeTab]: true }));

      try {
        // 4. API'yi çağırmak için token'a ihtiyacımız var
        const idToken = idTokenRef.current;
        if (!idToken) {
          throw new Error(
            "Kimlik doğrulama token'ı bulunamadı. (idTokenRef.current is null)"
          );
        }

        const headers = { Authorization: `Bearer ${idToken}` };

        // 5. YENİ API ENDPOINT'İNİ ÇAĞIR
        const response = await axiosInstance.current.get(
          `/api/users/profile/${username}/content`, // Profilin kullanıcı adı
          {
            headers,
            params: { tab: activeTab }, // ?tab=posts, ?tab=feelings vb.
          }
        );

        if (!mounted) return;

        // 6. Gelen veriyi işle
        const processedData = (response.data.content || []).map((item) => ({
          ...item,
          displayName: item.displayName || profileData.displayName,
          photoURL: item.photoURL || profileData.photoURL,
          username: item.username || profileData.username,
          isPrivate: profileData.isPrivate,
          uid: item.uid || profileData.uid,
        }));

        setAllData((prev) => ({
          ...prev,
          [activeTab]: processedData,
        }));
      } catch (error) {
        console.error(
          `Veri çekilirken hata oluştu (${activeTab}):`,
          error.response?.data || error.message
        );
        showToast("Gönderiler yüklenirken bir sorun oluştu.", "error");
      } finally {
        if (mounted) {
          setLoadingContent((prev) => ({ ...prev, [activeTab]: false }));
        }
      }
    };

    fetchTabData();

    return () => {
      mounted = false;
    };
  }, [activeTab, profileData, followStatus, username, showToast]);
  // ✅✅✅ GÜNCELLENEN BÖLÜM SONU ✅✅✅

  // ✅ GÜNCELLENDİ: handleFollowAction (UserProfile.jsx'teki mantıkla)
  const handleFollowAction = async () => {
    if (!profileData?.uid || isFollowProcessing) return;
    setIsFollowProcessing(true);

    const previousFollowStatus = followStatus;
    const isPrivate = profileData?.isPrivate;

    try {
      const idToken = idTokenRef.current; // ✅ Ref'ten al
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
          // ✅ axiosInstance
          headers,
        });
      } else {
        response = await axiosInstance.current.delete(endpoint, { headers }); // ✅ axiosInstance
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

  // ✅ GÜNCELLENDİ: handleBlockAction (UserProfile.jsx'teki mantıkla)
  const handleBlockAction = async () => {
    if (!profileData?.uid || isBlockProcessing) return;
    setIsBlockProcessing(true);

    const previousFollowStatus = followStatus;
    const targetUid = profileData.uid;

    try {
      const idToken = idTokenRef.current; // ✅ Ref'ten al
      if (!idToken) throw new Error("Kimlik doğrulama belirteci mevcut değil.");
      const headers = { Authorization: `Bearer ${idToken}` };

      let response;
      let newStatus;

      if (followStatus === "blocking") {
        // Engeli Kaldır
        response = await axiosInstance.current.delete( // ✅ axiosInstance
          `/api/users/unblock/${targetUid}`,
          { headers }
        );
        newStatus = "none";
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

        response = await axiosInstance.current.post( // ✅ axiosInstance
          `/api/users/block/${targetUid}`,
          {},
          { headers }
        );
        newStatus = "blocking";
        showToast("Kullanıcı engellendi.", "success");
      }

      setFollowStatus(response.data.status || newStatus);

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

  // ✅ GÜNCELLENDİ: handleStatClick (UserProfile.jsx'teki mantıkla)
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

  // ... (Video/Post modal handle fonksiyonları aynı) ...
  const handleVideoClick = (videoData) => {
    if (videoData && videoData.mediaUrl) {
      // Veriyi zenginleştir
      const fullData = {
        ...videoData,
        displayName: profileData.displayName,
        username: profileData.username,
        photoURL: profileData.photoURL,
        userProfileImage: profileData.photoURL,
      };
      setSelectedVideo(fullData);
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
      const fullData = {
        ...postData,
        displayName: profileData.displayName,
        username: profileData.username,
        photoURL: profileData.photoURL,
        followStatus: followStatus, // Takip durumunu da ekle
      };
      setSelectedPost(fullData);
      setShowPostModal(true);
    } else {
      console.error("Geçersiz gönderi verisi:", postData);
    }
  };

  const handleClosePostModal = () => {
    setShowPostModal(false);
    setSelectedPost(null);
  };

  // ✅ GÜNCELLENDİ: getCardComponent (Yeni 'type' alanlarına göre)
  const getCardComponent = (item) => {
    const type = item.type || activeTab; // Backend'den 'type' alanı gelir

    // Veriyi zenginleştir (Her karta profil sahibinin bilgisini ekle)
    const cardData = {
      ...item,
      displayName: profileData.displayName,
      username: profileData.username,
      photoURL: profileData.photoURL,
      isPrivate: profileData.isPrivate,
      uid: profileData.uid,
      ownerId: profileData.uid, // Feeds için
      userProfileImage: profileData.photoURL, // Feeds için
    };

    switch (type) {
      case "post":
      case "likes":
      case "tags":
        return (
          <PostThumbnail
            key={item.id}
            data={cardData}
            onClick={() => handlePostClick(cardData)} // handlePostClick'e cardData ver
          />
        );
      case "feeling":
        return <TweetCard key={item.id} data={cardData} />;
      case "feed":
        return (
          <VideoThumbnail
            key={item.id}
            mediaUrl={item.mediaUrl}
            onClick={() => handleVideoClick(cardData)} // handleVideoClick'e cardData ver
          />
        );
      default:
         // Fallback (eski global... anahtarları için)
        if (activeTab === "posts" || activeTab === "likes" || activeTab === "tags") {
           return <PostThumbnail key={item.id} data={cardData} onClick={() => handlePostClick(cardData)} />;
        }
        if (activeTab === "feelings") {
           return <TweetCard key={item.id} data={cardData} />;
        }
        if (activeTab === "feeds") {
           return <VideoThumbnail key={item.id} mediaUrl={item.mediaUrl} onClick={() => handleVideoClick(cardData)} />;
        }
        return null;
    }
  };

  // ... (emptyMessage aynı) ...
  const emptyMessage = () => {
    if (!profileData) return "Yükleniyor...";
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

  if (loading) {
    return <LoadingOverlay />;
  }

  // ✅ GÜNCELLENDİ: Hata ekranı (UserProfile.jsx'teki mantıkla)
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

  // ✅ GÜNCELLENDİ: Engellendi (blocked_by) ekranı (UserProfile.jsx'teki mantıkla)
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

  const canViewContent =
    !profileData.isPrivate ||
    followStatus === "following" ||
    followStatus === "self";

  const { displayName, photoURL, bio, familySystem, stats } = profileData;

  // ✅ GÜNCELLENDİ: Takip Butonu (UserProfile.jsx'teki mantıkla)
  const renderFollowButton = () => {
    switch (followStatus) {
      case "self":
      case "blocking":
      case "blocked_by":
        return null;
      case "following":
        return (
          <button
            onClick={handleFollowAction}
            className={`${styles.unfollowBtn} ${styles.actionButton}`} // Kendi CSS'inize göre stiller
            disabled={isFollowProcessing}
          >
            <FaUserMinus /> Takibi Bırak
          </button>
        );
      case "pending":
        return (
          <button
            onClick={handleFollowAction}
            className={`${styles.pendingBtn} ${styles.actionButton}`} // Kendi CSS'inize göre stiller
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
            className={`${styles.followBtn} ${styles.actionButton}`} // Kendi CSS'inize göre stiller
            disabled={isFollowProcessing}
          >
            <FaUserPlus /> Takip Et
          </button>
        );
    }
  };

  // ✅ GÜNCELLENDİ: Engelleme Butonu (UserProfile.jsx'teki mantıkla)
  const renderBlockButton = () => {
    switch (followStatus) {
      case "self":
      case "blocked_by":
        return null;
      case "blocking":
        return (
          <button
            onClick={handleBlockAction}
            className={`${styles.unfollowBtn} ${styles.actionButton}`}
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
            className={`${styles.blockBtn} ${styles.actionButton}`}
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
    /* { key: "likes", label: "Beğenilenler", disabled: !canViewContent || followStatus === 'blocking' },
    { key: "tags", label: "Etiketliler", disabled: !canViewContent || followStatus === 'blocking' }, */
  ];

  // ✅ GÜNCELLENDİ: totalContentCount ve rtaScore (profileData.stats'tan)
  const totalContentCount =
    (profileData.stats?.posts || 0) +
    (profileData.stats?.feeds || 0) +
    (profileData.stats?.feelings || 0);
  const rtaScore = profileData.stats?.rta || 0;
  const currentData = allData[activeTab] || [];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.username}>{username}</div>
        <div className={styles.actions}>
          {followStatus === "self" ? (
            <Link to="/settings" className={styles.actionBtn}>
              <IoIosSettings className={styles.icon} />
            </Link>
          ) : null}
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
                {followStatus === "blocking" ? 0 : totalContentCount}
              </span>
              <span className={styles.statLabel}>Posts</span>
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

      {followStatus !== "blocking" && (
        <div className={styles.bioSection}>
          <h1 className={styles.name}>{displayName}</h1>
          {familySystem && <div className={styles.tag}>{familySystem}</div>}
          <p className={styles.bioText}>
            {bio || "Henüz bir biyografi eklemediniz."}
          </p>
        </div>
      )}

      {followStatus !== "self" && (
        <div className={styles.actionButtons}>
          {renderFollowButton()}
          {renderBlockButton()}
          {/* Mesaj butonu (gerekirse) buraya eklenebilir */}
        </div>
      )}
      
      {/* Kendi profilindeki butonlar (Eski mantık) */}
      {followStatus === "self" && (
         <div className={styles.actionButtons}>
            <button className={styles.editButton}>Edit Profile</button>
            <button className={styles.shareButton}>Share Profile</button>
         </div>
      )}


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
            ) : currentData.length > 0 ? (
              <div
                className={
                  activeTab === "feelings"
                    ? styles.feelingsGrid
                    : activeTab === "feeds"
                    ? styles.feedsGrid
                    : styles.postsGrid
                }
              >
                {currentData.map(getCardComponent)}
                {/* ⛔️ Pagination (Load More) butonu kaldırıldı */}
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

      {showModal && profileData && (
        <ConnectionsModal
          show={showModal}
          onClose={() => setShowModal(false)}
          listType={modalType}
          currentUserId={profileData.uid} // ✅ profileData'dan alındı
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