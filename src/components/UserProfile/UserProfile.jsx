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
  FaBan,
  FaLock,
} from "react-icons/fa";
import axios from "axios";
// ⛔️ Firebase importları kaldırıldı
// import { db } from "../../config/firebase-client";
// import { collection, query, getDocs, orderBy, where } from "firebase/firestore";
import PostCard from "../Post/PostCard";
import TweetCard from "../TweetCard/TweetCard";
import PostVideoCard from "../Feeds/FeedVideoCard/FeedVideoCard";
import VideoThumbnail from "../AccountPage/Box/VideoThumbnail/VideoThumbnail";
import Footer from "../Footer/Footer";

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
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
    likes: [], // Bu sekmeler artık doldurulmayacak
    tags: [], // Bu sekmeler artık doldurulmayacak
  });
  const [loadingContent, setLoadingContent] = useState({});
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isFollowProcessing, setIsFollowProcessing] = useState(false);
  const [isBlockProcessing, setIsBlockProcessing] = useState(false);

  const apiBaseUrl = process.env.REACT_APP_API_URL;
  const idTokenRef = useRef(null);
  // ⛔️ cachedLikedIdsRef ve cachedSavedIdsRef kaldırıldı
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

  useEffect(() => {
    let mounted = true;
    console.log("API BASE URL:", apiBaseUrl);
    const fetchProfileAndStatus = async () => {
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
          setProfileData(profile);
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

    if (username) {
      fetchProfileAndStatus();
    }
    return () => {
      mounted = false;
    };
  }, [username, currentUser]);

  // ⛔️ fetchLikesAndTags useEffect bloğu kaldırıldı.
  // ⛔️ chunkArray fonksiyonu kaldırıldı.
  // ⛔️ fetchPostsByIds fonksiyonu kaldırıldı.

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

      // 2. 'likes' veya 'tags' sekmeleri (Yorum satırında olsalar da kontrolü kalsın)
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

    // fetchTabData'yı çağıran eski 'if' bloğu kaldırıldı
    // ve doğrudan 'fetchTabData' çağrıldı (içeride kontroller zaten var).
    fetchTabData();

    return () => {
      mounted = false;
    };
  }, [activeTab, profileData, followStatus, username, showToast]);
  // ✅✅✅ GÜNCELLENEN BÖLÜM SONU ✅✅✅

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

  const handleBlockAction = async () => {
    if (!profileData?.uid || isBlockProcessing) return;
    setIsBlockProcessing(true);

    const previousFollowStatus = followStatus;
    const targetUid = profileData.uid;

    try {
      const idToken = idTokenRef.current;
      if (!idToken) throw new Error("Kimlik doğrulama belirteci mevcut değil.");
      const headers = { Authorization: `Bearer ${idToken}` };

      let response;
      let newStatus;

      if (followStatus === "blocking") {
        // Engeli Kaldır
        response = await axiosInstance.current.delete(
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

        response = await axiosInstance.current.post(
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

  const handleVideoClick = (videoData) => {
    if (videoData && videoData.mediaUrl) {
      const fullVideoData = {
        ...videoData,
        uid: videoData.ownerId,
        username: profileData.username,
        userProfileImage: profileData.photoURL,
        isPrivate: profileData.isPrivate,
        displayName: profileData.displayName,
      };
      setSelectedVideo(fullVideoData);
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
    // 'type'ı backend'den gelen 'type' alanından almayı deneyelim,
    // yoksa 'activeTab'ı kullanalım.
    const type = item.type || activeTab;

    // Backend'den gelen veriye, profil sahibinin verilerini ekle
    const cardData = {
      ...item,
      uid: profileData.uid,
      displayName: profileData.displayName,
      photoURL: profileData.photoURL,
      isPrivate: profileData.isPrivate,
      ownerId: profileData.uid, // Feeds için
      userProfileImage: profileData.photoURL, // Feeds için
    };

    switch (type) {
      case "post":
      case "likes": // 'likes' ve 'tags' artık bu fonksiyona gelmemeli
      case "tags":  // ama eski mantık bozulmasın diye tutuluyor.
        return (
          <PostCard
            key={item.id}
            data={cardData}
            followStatus={followStatus}
            onFollowStatusChange={(newStatus) => setFollowStatus(newStatus)}
          />
        );
      case "feeling":
        return <TweetCard key={item.id} data={cardData} />;
      case "feed":
        return (
          <VideoThumbnail
            key={item.id}
            mediaUrl={item.mediaUrl}
            onClick={() => handleVideoClick(cardData)}
          />
        );
      default:
        // Eski 'globalPosts' vb. anahtarları için de destek (artık gelmemeli)
        if (activeTab === "posts" || activeTab === "likes" || activeTab === "tags") {
            return <PostCard key={item.id} data={cardData} followStatus={followStatus} onFollowStatusChange={(newStatus) => setFollowStatus(newStatus)} />;
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

  if (loading) {
    return <LoadingOverlay />;
  }

  if (error) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.fixedTopBox}>{username}</div>
        <div className={styles.private_message}>
          <FaBan className={styles.privateAccountIcon} />
          <h3>{error}</h3>
          <p>Lütfen daha sonra tekrar deneyin veya ana sayfaya dönün.</p>
        </div>
      </div>
    );
  }

  if (followStatus === "blocked_by") {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.fixedTopBox}>{username}</div>
        <div className={styles.private_message} style={{ paddingTop: "50px" }}>
          <FaLock className={styles.privateAccountIcon} />
          <h3>Kullanıcı bulunamadı</h3>
          <p>Bu hesabı görme yetkiniz bulunmamaktadır.</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return <LoadingOverlay />;
  }

  const canViewContent =
    !profileData.isPrivate ||
    followStatus === "following" ||
    followStatus === "self";

  const { displayName, photoURL, bio, familySystem } = profileData;
  const currentContent = allData[activeTab] || [];
  
  // Stats'ı doğrudan profileData'dan al, çünkü backend artık bunu sağlıyor
  const totalContentCount =
    (profileData.stats?.posts || 0) +
    (profileData.stats?.feeds || 0) +
    (profileData.stats?.feelings || 0);

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

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.account_top}>
        <div className={styles.fixedTopBox}>{username}</div>
      </div>

      {followStatus !== "self" && (
        <div className={styles.buttonsContainer}>
          {renderFollowButton()}
          {renderBlockButton()}
        </div>
      )}

      {followStatus === "blocking" ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
            color: "#555",
          }}
        >
          <FaBan
            style={{
              fontSize: "48px",
              color: "#888",
              display: "block",
              margin: "0 auto 20px auto",
            }}
          />
          <h3 style={{ margin: "10px 0", fontSize: "22px", fontWeight: "600" }}>
            Bu hesabı engellediniz.
          </h3>
          <p style={{ fontSize: "16px", color: "#666" }}>
            Bu kullanıcının gönderilerini veya profilini göremezsiniz. Engeli
            kaldırmak için yukarıdaki butonu kullanın.
          </p>
        </div>
      ) : (
        <>
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
            {/* <button
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
            */}
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
        </>
      )}

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
            <PostVideoCard
              data={selectedVideo}
              followStatus={followStatus}
              onFollowStatusChange={(newStatus) => setFollowStatus(newStatus)}
            />
          </div>
        </div>
      )}
      <div className={styles.footerWrapper}>
        <Footer />
      </div>
    </div>
  );
};

export default UserProfile;