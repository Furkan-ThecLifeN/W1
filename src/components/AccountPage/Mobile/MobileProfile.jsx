// MobileProfile.jsx

import React, { useState, useEffect } from "react";
import { IoIosSettings } from "react-icons/io";
import styles from "./MobileProfile.module.css";
import { Link } from "react-router-dom";
import { useUser } from "../../../context/UserContext";
import { useAuth } from "../../../context/AuthProvider";
import LoadingOverlay from "../../LoadingOverlay/LoadingOverlay";
import ConnectionsModal from "../../ConnectionsModal/ConnectionsModal";
import { db } from "../../../config/firebase-client";
import {
  collection,
  query,
  getDocs,
  orderBy,
  where,
} from "firebase/firestore";

// GÜNCEL KART İMPORTLARI
import PostCard from "../../Post/PostCard"; // Tam gönderi kartı
import TweetCard from "../../TweetCard/TweetCard"; // Duygu kartı
import PostThumbnail from "../Box/PostThumbnail/PostThumbnail";
import VideoThumbnail from "../Box/VideoThumbnail/VideoThumbnail";
import FeedVideoCard from "../../Feeds/FeedVideoCard/FeedVideoCard"; // Tam ekran video kartı

const MobileProfile = () => {
  const { currentUser, loading } = useUser();
  const { showToast } = useAuth();
  const [activeTab, setActiveTab] = useState("posts");
  const [allData, setAllData] = useState({
    posts: [],
    feelings: [],
    feeds: [],
    likes: [],
    tags: [],
  });
  const [loadingContent, setLoadingContent] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  
  // ✅ YENİ: POST MODAL STATE'LERİ
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const [postCounts, setPostCounts] = useState({
    posts: 0,
    feelings: 0,
    feeds: 0,
  });

  // ---------------- COUNT POSTS ---------------- (Değişiklik yok)
  useEffect(() => {
    const fetchPostCounts = async () => {
      if (!currentUser?.uid) return;
      try {
        const postsQuery = query(
          collection(db, "globalPosts"),
          where("uid", "==", currentUser.uid)
        );
        const feelingsQuery = query(
          collection(db, "globalFeelings"),
          where("uid", "==", currentUser.uid)
        );
        const feedsQuery = query(
          collection(db, "globalFeeds"),
          where("ownerId", "==", currentUser.uid)
        );

        const [postsSnapshot, feelingsSnapshot, feedsSnapshot] = await Promise.all([
          getDocs(postsQuery),
          getDocs(feelingsQuery),
          getDocs(feedsQuery),
        ]);

        setPostCounts({
          posts: postsSnapshot.size,
          feelings: feelingsSnapshot.size,
          feeds: feedsSnapshot.size,
        });
      } catch (error) {
        console.error("Gönderi sayıları çekilirken hata oluştu:", error);
      }
    };

    if (currentUser) {
      fetchPostCounts();
    }
  }, [currentUser]);

  // ---------------- FETCH DATA BASED ON ACTIVE TAB ---------------- (Değişiklik yok)
  useEffect(() => {
    const fetchTabData = async () => {
      if (!currentUser || !currentUser.uid) return;

      // Check if data for the active tab already exists
      if (allData[activeTab]?.length > 0 && activeTab !== "likes" && activeTab !== "tags") {
        return; // Use cached data, no need to fetch again
      }

      setLoadingContent(prev => ({ ...prev, [activeTab]: true }));

      try {
        let snapshot;
        let queryToRun;

        const processSnapshot = (snapshot, type, likedIds = [], savedIds = []) => {
          let data = snapshot.docs.map(doc => {
            const item = { id: doc.id, ...doc.data() };
            // Yeni kartların beklediği initialLiked ve initialSaved prop'larını ekliyoruz.
            item.initialLiked = likedIds.includes(item.id);
            item.initialSaved = savedIds.includes(item.id);
            return item;
          });
          if (type === "feeds") {
            data = data.filter(item => item.mediaUrl);
          }
          return data;
        };

        // Fetch likes and tags data first for all tabs
        const [likesSnapshot, tagsSnapshot] = await Promise.all([
          getDocs(collection(db, "users", currentUser.uid, "likes")),
          getDocs(collection(db, "users", currentUser.uid, "tags")),
        ]);
        const likedIds = likesSnapshot.docs.map(doc => doc.id);
        const savedIds = tagsSnapshot.docs.map(doc => doc.id);

        switch (activeTab) {
          case "posts":
            queryToRun = query(collection(db, "globalPosts"), where("uid", "==", currentUser.uid), orderBy("createdAt", "desc"));
            snapshot = await getDocs(queryToRun);
            setAllData(prev => ({ ...prev, [activeTab]: processSnapshot(snapshot, activeTab, likedIds, savedIds) }));
            break;
          case "feelings":
            queryToRun = query(collection(db, "globalFeelings"), where("uid", "==", currentUser.uid), orderBy("createdAt", "desc"));
            snapshot = await getDocs(queryToRun);
            setAllData(prev => ({ ...prev, [activeTab]: processSnapshot(snapshot, activeTab, likedIds, savedIds) }));
            break;
          case "feeds":
            queryToRun = query(collection(db, "globalFeeds"), where("ownerId", "==", currentUser.uid), orderBy("createdAt", "desc"));
            snapshot = await getDocs(queryToRun);
            setAllData(prev => ({ ...prev, [activeTab]: processSnapshot(snapshot, activeTab, likedIds, savedIds) }));
            break;
          case "likes":
            // Fetch the actual liked posts
            if (likedIds.length > 0) {
              const likedPostsQuery = query(collection(db, "globalPosts"), where("__name__", "in", likedIds), orderBy("createdAt", "desc"));
              const likedPostsSnapshot = await getDocs(likedPostsQuery);
              setAllData(prev => ({ ...prev, [activeTab]: processSnapshot(likedPostsSnapshot, activeTab, likedIds, savedIds) }));
            } else {
              setAllData(prev => ({ ...prev, [activeTab]: [] }));
            }
            break;
          case "tags":
            // Fetch the actual tagged posts
            if (savedIds.length > 0) {
              const taggedPostsQuery = query(collection(db, "globalPosts"), where("__name__", "in", savedIds), orderBy("createdAt", "desc"));
              const taggedPostsSnapshot = await getDocs(taggedPostsQuery);
              setAllData(prev => ({ ...prev, [activeTab]: processSnapshot(taggedPostsSnapshot, activeTab, likedIds, savedIds) }));
            } else {
              setAllData(prev => ({ ...prev, [activeTab]: [] }));
            }
            break;
          default:
            setAllData(prev => ({ ...prev, [activeTab]: [] }));
            break;
        }
      } catch (error) {
        console.error(`🔥 Veri çekilirken hata oluştu (${activeTab}):`, error);
        const errorMessage = error.code === 'failed-precondition'
          ? "Dizin hatası: İçerikleri görüntülemek için Firebase'de gerekli dizinlerin oluşturulması gerekiyor. Lütfen konsolu kontrol edin."
          : "Veriler yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.";
        showToast(errorMessage, "error");
      } finally {
        setLoadingContent(prev => ({ ...prev, [activeTab]: false }));
      }
    };

    if (currentUser) {
      fetchTabData();
    }
  }, [activeTab, currentUser, showToast]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
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

  // ✅ YENİ: POST MODAL HANDLER'LARI
  const handlePostClick = (postData) => {
    if (postData && postData.id) {
      // Gerekirse burada PostCard'ın ihtiyaç duyacağı ek verileri ekleyebiliriz
      setSelectedPost(postData);
      setShowPostModal(true);
    } else {
      console.error("Geçersiz gönderi verisi:", postData);
    }
  };

  const handleClosePostModal = () => {
    setShowPostModal(false);
    setSelectedPost(null);
  };


  if (loading) return <LoadingOverlay />;
  if (!currentUser) return <div>Lütfen giriş yapın.</div>;

  const { username, displayName, photoURL, bio, familySystem, uid } =
    currentUser;

  const handleStatClick = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  // Yeni kart prop yapısına göre güncellendi
  const getCardComponent = (item) => {
    switch (activeTab) {
      case "posts":
      case "likes":
      case "tags":
        // ✅ DÜZELTME: Artık PostCard yerine PostThumbnail kullanılıyor
        return (
          <PostThumbnail
            key={item.id}
            data={item} // Post verisini 'data' prop'u ile iletiyoruz.
            onClick={handlePostClick} // Tıklama olayını PostModal'ı açacak şekilde ayarlıyoruz.
          />
        );
      case "feelings":
        return (
          <TweetCard
            key={item.id}
            data={item} // Duygu verisini 'data' prop'u ile iletiyoruz.
          />
        );
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
    switch (activeTab) {
      case "posts":
        return `${displayName || username}, henüz bir gönderi paylaşmadınız.`;
      case "feelings":
        return `${displayName || username}, henüz bir duygu paylaşmadınız.`;
      case "feeds":
        return `${
          displayName || username
        }, henüz feed'leriniz bulunmamaktadır.`;
      case "likes":
        return `${displayName || username}, henüz bir gönderiyi beğenmediniz.`;
      case "tags":
        return `${
          displayName || username
        }, henüz etiketlendiğiniz bir gönderi bulunmamaktadır.`;
      default:
        return `Henüz bir içerik bulunmamaktadır.`;
    }
  };

  const tabs = [
    { key: "posts", label: "Posts" },
    { key: "feelings", label: "Feelings" },
    { key: "feeds", label: "Feeds" },
    { key: "likes", label: "Beğenilenler" },
    { key: "tags", label: "Etiketliler" },
  ];

  const currentData = allData[activeTab] || [];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.username}>{username}</div>
        <div className={styles.actions}>
          <Link to="/settings" className={styles.actionBtn}>
            <IoIosSettings className={styles.icon} />
          </Link>
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
              <span className={styles.statNumber}>{postCounts.posts + postCounts.feelings + postCounts.feeds}</span>
              <span className={styles.statLabel}>Posts</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>0</span>
              <span className={styles.statLabel}>RTA</span>
            </div>
          </div>
          <div className={styles.stat_content}>
            <div
              className={styles.stat}
              onClick={() => handleStatClick("followers")}
              style={{ cursor: "pointer" }}
            >
              <span className={styles.statNumber}>{currentUser.stats?.followers || 0}</span>
              <span className={styles.statLabel}>Followers</span>
            </div>
            <div
              className={styles.stat}
              onClick={() => handleStatClick("following")}
              style={{ cursor: "pointer" }}
            >
              <span className={styles.statNumber}>{currentUser.stats?.following || 0}</span>
              <span className={styles.statLabel}>Following</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bioSection}>
        <h1 className={styles.name}>{displayName}</h1>
        {familySystem && <div className={styles.tag}>{familySystem}</div>}
        <p className={styles.bioText}>
          {bio || "Henüz bir biyografi eklemediniz."}
        </p>
      </div>

      <div className={styles.actionButtons}>
        <button className={styles.editButton}>Edit Profile</button>
        <button className={styles.shareButton}>Share Profile</button>
      </div>

      <div className={styles.tabs}>
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            className={`${styles.tab} ${
              activeTab === key ? styles.activeTab : ""
            }`}
            onClick={() => handleTabChange(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={styles.tabContent}>
        {loadingContent[activeTab] ? (
          <LoadingOverlay />
        ) : currentData.length > 0 ? (
          <div
            // posts, likes, tags için PostThumbnail'ın sığacağı bir grid yapısı gerekiyor.
            className={
              activeTab === "feelings"
                ? styles.feelingsGrid
                : activeTab === "feeds"
                ? styles.feedsGrid
                : styles.postsGrid // Artık burada PostThumbnail'lar gösterilecek.
            }
          >
            {currentData.map(getCardComponent)}
          </div>
        ) : (
          <div className={styles.emptyState}>{emptyMessage()}</div>
        )}
      </div>

      {showModal && currentUser && (
        <ConnectionsModal
          show={showModal}
          onClose={() => setShowModal(false)}
          listType={modalType}
          currentUserId={uid}
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
            />
          </div>
        </div>
      )}

      {/* ✅ YENİ: POST MODALI */}
      {showPostModal && selectedPost && (
        <div 
          className={styles.videoModalOverlay} // Tam ekran arka plan karartması
          onClick={handleClosePostModal} // Dışarı tıklama ile kapatma
        >
          <div 
            // Modal içeriğini PostCard'ın sığabileceği şekilde ayarlayın
            className={`${styles.videoModalContent} ${styles.postModalContent}`} 
            onClick={(e) => e.stopPropagation()} // İçeriğe tıklamayı engelle
          >
            {/* PostCard'ı modal içeriği olarak göster */}
            <PostCard 
              data={selectedPost}
              // Modal içinde gösterildiği için followStatus'u ekleyelim (mevcut data'da varsa)
              followStatus={selectedPost.followStatus || "none"}
            />
            {/* Kullanıcı deneyimi için basit bir kapatma butonu */}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileProfile;