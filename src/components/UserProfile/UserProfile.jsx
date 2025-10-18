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
  FaBan, // FaEllipsisV, FaFlag, FaCommentDots kaldırıldı, FaBan zaten var
  FaLock,
} from "react-icons/fa";
import axios from "axios";
import { db } from "../../config/firebase-client";
import { collection, query, getDocs, orderBy, where } from "firebase/firestore";
import PostCard from "../Post/PostCard";
import TweetCard from "../TweetCard/TweetCard";
import PostVideoCard from "../Feeds/FeedVideoCard/FeedVideoCard";
import VideoThumbnail from "../AccountPage/Box/VideoThumbnail/VideoThumbnail";

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { currentUser, showToast } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("posts");
  // const [showDropdown, setShowDropdown] = useState(false); // KALDIRILDI
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
  const [isBlockProcessing, setIsBlockProcessing] = useState(false); // YENİ EKLENDİ

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

  useEffect(() => {
    let mounted = true;
    console.log("API BASE URL:", apiBaseUrl);
    const fetchProfileAndStatus = async () => {
      setLoading(true);
      setError(null);
      setProfileData(null); // YENİ: Kullanıcı değiştirirken eski veriyi temizle
      setFollowStatus("none"); // YENİ: Durumu sıfırla
      
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
            // GÜNCELLENDİ: 'blocking' ve 'blocked_by' durumları eklendi
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
        // GÜNCELLENDİ: Engellenen veya bulunamayan kullanıcıyı ayır
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

  // ... (useEffect [profileData?.uid] ve chunkArray, fetchPostsByIds aynı)
  
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

  const chunkArray = (arr, size) => {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  };

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
  

  useEffect(() => {
    let mounted = true;
    const fetchTabData = async () => {
      if (!profileData || !profileData.uid) return;
      
      // GÜNCELLENDİ: Engelleme durumlarını kontrol et
      const canViewContent =
        !profileData.isPrivate ||
        followStatus === "following" ||
        followStatus === "self";
      
      // Engelleme durumunda veya gizli hesapta içerik çekme
      if (
        followStatus === "blocking" || 
        followStatus === "blocked_by" ||
        (!canViewContent && ["likes", "tags"].includes(activeTab)) ||
        (!canViewContent && profileData.isPrivate)
      ) {
         setLoadingContent((prev) => ({ ...prev, [activeTab]: false }));
         setAllData((prev) => ({ ...prev, [activeTab]: [] }));
         return;
      }
      
      if (allData[activeTab]?.length > 0) return;

      setLoadingContent((prev) => ({ ...prev, [activeTab]: true }));
      try {
        const processSnapshot = (docs, type) => {
          const likedIds = cachedLikedIdsRef.current;
          const savedIds = cachedSavedIdsRef.current;
          
          const commonUserData = {
            displayName: profileData.displayName,
            photoURL: profileData.photoURL,
            username: profileData.username,
            isPrivate: profileData.isPrivate,
            uid: profileData.uid,
          };
          
          let data = docs.map((item) => {
            const itemId = item.id || item.__name__;
            const isLiked = likedIds.includes(itemId);
            const isSaved = savedIds.includes(itemId);
            
            const feedSpecificData = (type === "feeds" || item.mediaUrl) ? {
              ownerId: item.uid || item.ownerId,
              userProfileImage: commonUserData.photoURL,
              username: commonUserData.username,
            } : {};

            return {
              id: itemId,
              ...item,
              ...commonUserData,
              ...feedSpecificData,
              initialLiked: isLiked,
              initialSaved: isSaved,
            };
          });
          
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
        !profileData.isPrivate) &&
      followStatus !== "blocking" && // YENİ: Engelleme durumunda çekme
      followStatus !== "blocked_by"
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

  // YENİ: Engelleme/Engeli Kaldırma Fonksiyonu
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
        
        response = await axiosInstance.current.post(
          `/api/users/block/${targetUid}`,
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
      console.error("Engelleme işlemi hatası:", err.response?.data || err.message);
      setFollowStatus(previousFollowStatus);
      const errorMsg = err.response?.data?.error || "İşlem başarısız.";
      showToast(errorMsg, "error");
    } finally {
      setIsBlockProcessing(false);
    }
  };


  // handleMessageAction KALDIRILDI
  // handleBlockUser, handleReportUser, handleFeedback KALDIRILDI
  // toggleDropdown KALDIRILDI

  const handleStatClick = (type) => {
    // GÜNCELLENDİ: Engelleme durumunda modal açılmasın
    if (
      followStatus === "blocking" || 
      followStatus === "blocked_by"
    ) {
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

  // ... (handleVideoClick, handleCloseVideoModal, emptyMessage, getCardComponent fonksiyonları aynı)
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
    const type = item.originalType || activeTab;
    
    const cardData = {
      ...item,
      uid: profileData.uid,
      displayName: profileData.displayName,
      photoURL: profileData.photoURL,
      isPrivate: profileData.isPrivate,
      ownerId: profileData.uid,
      userProfileImage: profileData.photoURL,
    };

    switch (type) {
      case "globalPosts":
      case "posts":
      case "likes":
      case "tags":
        return (
          <PostCard 
            key={item.id} 
            data={cardData} 
            followStatus={followStatus}
            onFollowStatusChange={(newStatus) => setFollowStatus(newStatus)}
          />
        );
      case "globalFeelings":
      case "feelings":
        return <TweetCard key={item.id} data={cardData} />;
      case "globalFeeds":
      case "feeds":
        return (
          <VideoThumbnail
            key={item.id}
            mediaUrl={item.mediaUrl}
            onClick={() => handleVideoClick(cardData)} 
          />
        );
      default:
        return null;
    }
  };


  if (loading) {
    return <LoadingOverlay />;
  }

  // GÜNCELLENDİ: Hata durumunda da kullanıcı adını göster
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

  // YENİ: Engellenen (blocked_by) kullanıcı ekranı
  // Bu durum, profil verisi yüklendikten SONRA ama içerikten ÖNCE kontrol edilmeli.
  if (followStatus === "blocked_by") {
     return (
        <div className={styles.pageWrapper}>
          <div className={styles.fixedTopBox}>{username}</div>
          <div className={styles.private_message} style={{paddingTop: '50px'}}>
            <FaLock className={styles.privateAccountIcon} />
            <h3>Kullanıcı bulunamadı</h3>
            <p>Bu hesabı görme yetkiniz bulunmamaktadır.</p>
          </div>
        </div>
      );
  }
  
  if (!profileData) {
    // Bu durum normalde error veya blocked_by tarafından yakalanmalı
    return <LoadingOverlay />;
  }


  // GÜNCELLENDİ: Engelleme durumunu da kontrol et
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
      case "blocking": // YENİ: Engelliyorsan takip butonu gösterme
      case "blocked_by": // YENİ: Engellendiysen takip butonu gösterme
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
  
  // YENİ: Engelleme Butonunu Render Etme Fonksiyonu
  const renderBlockButton = () => {
     switch (followStatus) {
      case "self":
      case "blocked_by": // Engellendiysen engelleme butonu gösterme
        return null;
      case "blocking":
         return (
          <button
            onClick={handleBlockAction}
            className={`${styles.unfollowBtn} ${styles.actionButton}`} // 'unfollow' stili (gri)
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
            className={`${styles.blockBtn} ${styles.actionButton}`} // YENİ CSS SINIFI GEREKEBİLİR
            disabled={isBlockProcessing}
          >
            <FaBan /> Engelle
          </button>
        );
     }
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.account_top}>
        <div className={styles.fixedTopBox}>{username}</div>
        {/* Dropdown menü ve butonu KALDIRILDI */}
      </div>

      {/* GÜNCELLENDİ: Buton konteyneri */}
      {followStatus !== "self" && (
        <div className={styles.buttonsContainer}>
          {renderFollowButton()}
          {renderBlockButton()} 
          {/* Mesaj butonu KALDIRILDI */}
        </div>
      )}

      {/* ✅✅✅ DEĞİŞİKLİK BURADA ✅✅✅ */}
      {/* YENİ: Engellenen (blocking) kullanıcı ekranı (Mobile stiliyle güncellendi) */}
      {followStatus === "blocking" ? (
        <div 
          // CSS dosyanıza güvenmek yerine stili doğrudan uyguluyoruz
          // Bu, MobileUserProfile.jsx'teki .private_message stilidir
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#555'
          }}
        >
           <FaBan 
              // className={styles.privateAccountIcon} 
              // Bu da MobileUserProfile.jsx'teki .privateAccountIcon stilidir
              style={{
                fontSize: '48px',
                color: '#888',
                display: 'block',
                margin: '0 auto 20px auto' // İkonu ortalamak için
              }}
           />
           <h3 style={{ margin: '10px 0', fontSize: '22px', fontWeight: '600' }}>
             Bu hesabı engellediniz.
           </h3>
           <p style={{ fontSize: '16px', color: '#666' }}>
             Bu kullanıcının gönderilerini veya profilini göremezsiniz. 
             Engeli kaldırmak için yukarıdaki butonu kullanın.
           </p>
        </div>
      ) : (
        <>
          {/* Profilin geri kalanı (eğer engellenmediyse) */}
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
    </div>
  );
};

export default UserProfile;