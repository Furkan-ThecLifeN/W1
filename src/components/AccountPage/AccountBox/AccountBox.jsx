// AccountBox.jsx

import React, { useState, useEffect } from "react";
import { IoIosSettings } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import styles from "./AccountBox.module.css";
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

// ✅ GÜNCEL KART İMPORTLARI
// Yeni PostCard, TweetCard, VideoThumbnail ve FeedVideoCard'ı import ediyoruz.
import PostCard from "../../Post/PostCard";
import TweetCard from "../../TweetCard/TweetCard";
import VideoThumbnail from "../Box/VideoThumbnail/VideoThumbnail"; // Grid önizlemesi için yeni path
import FeedVideoCard from "../../Feeds/FeedVideoCard/FeedVideoCard"; // Modal/Tam oynatıcı için yeni kart

// --------------------- Main Component ---------------------

const AccountBox = () => {
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
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [postCounts, setPostCounts] = useState({
    posts: 0,
    feelings: 0,
    feeds: 0,
  });

  // ---------------- COUNT POSTS ----------------
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

  // ---------------- FETCH DATA BASED ON ACTIVE TAB ----------------
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

        const processSnapshot = (snapshot, type) => {
          let data = snapshot.docs.map(doc => {
            const item = { id: doc.id, ...doc.data() };
            // Yeni kartların beklediği initialLiked ve initialSaved prop'larını ekliyoruz.
            // Bu kısım artık backend'den gelen gerçek duruma göre ayarlanmalı.
            // Basitlik için varsayılan değerler kullanılmıştır.
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
            setAllData(prev => ({ ...prev, [activeTab]: processSnapshot(snapshot, activeTab) }));
            break;
          case "feelings":
            queryToRun = query(collection(db, "globalFeelings"), where("uid", "==", currentUser.uid), orderBy("createdAt", "desc"));
            snapshot = await getDocs(queryToRun);
            setAllData(prev => ({ ...prev, [activeTab]: processSnapshot(snapshot, activeTab) }));
            break;
          case "feeds":
            queryToRun = query(collection(db, "globalFeeds"), where("ownerId", "==", currentUser.uid), orderBy("createdAt", "desc"));
            snapshot = await getDocs(queryToRun);
            setAllData(prev => ({ ...prev, [activeTab]: processSnapshot(snapshot, activeTab) }));
            break;
          case "likes":
            // Fetch the actual liked posts (globalPosts koleksiyonundan)
            if (likedIds.length > 0) {
              // Firebase'in 'in' sorgusunda maksimum 10 ID'ye izin verdiğini unutmayın.
              const likedPostsQuery = query(collection(db, "globalPosts"), where("__name__", "in", likedIds), orderBy("createdAt", "desc"));
              const likedPostsSnapshot = await getDocs(likedPostsQuery);
              setAllData(prev => ({ ...prev, [activeTab]: processSnapshot(likedPostsSnapshot, activeTab) }));
            } else {
              setAllData(prev => ({ ...prev, [activeTab]: [] }));
            }
            break;
          case "tags":
            // Fetch the actual tagged posts (globalPosts koleksiyonundan)
            if (savedIds.length > 0) {
              const taggedPostsQuery = query(collection(db, "globalPosts"), where("__name__", "in", savedIds), orderBy("createdAt", "desc"));
              const taggedPostsSnapshot = await getDocs(taggedPostsQuery);
              setAllData(prev => ({ ...prev, [activeTab]: processSnapshot(taggedPostsSnapshot, activeTab) }));
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

  if (loading) {
    return <LoadingOverlay />;
  }

  if (!currentUser) {
    return <div>Lütfen giriş yapın.</div>;
  }

  const { username, displayName, photoURL, bio, familySystem, stats } = currentUser;

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
        return (
          <PostCard
            key={item.id}
            data={item} // Post verisini 'data' prop'u ile iletiyoruz.
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
        return `${displayName || username}, henüz feed'leriniz bulunmamaktadır.`;
      case "likes":
        return `${displayName || username}, henüz bir gönderiyi beğenmediniz.`;
      case "tags":
        return `${displayName || username}, henüz etiketlendiğiniz bir gönderi bulunmamaktadır.`;
      default:
        return `Henüz bir içerik bulunmamaktadır.`;
    }
  };

  const currentData = allData[activeTab] || [];

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.account_top}>
        <div className={styles.fixedTopBox}>{username}</div>
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
            <img src={photoURL} alt="Profile" className={styles.profileImage} />
          </div>
          <div className={styles.imageBackground}></div>
        </div>

        <div className={styles.profileInfoSection}>
          <h2 className={styles.profileName}>{displayName}</h2>
          {familySystem && <div className={styles.tagBox}>{familySystem}</div>}
          <div className={styles.bio}>
            {bio || "Henüz bir biyografi eklemediniz."}
          </div>
        </div>

        <div className={styles.statsSection}>
          <div className={styles.statBox}>
            <strong>{postCounts.posts + postCounts.feelings + postCounts.feeds}</strong>
            <span className={styles.statLabel}>Posts</span>
          </div>
          <div
            className={styles.statBox}
            onClick={() => handleStatClick("followers")}
          >
            <strong>{stats?.followers || 0}</strong>
            <span className={styles.statLabel}>Followers</span>
          </div>
          <div
            className={styles.statBox}
            onClick={() => handleStatClick("following")}
          >
            <strong>{stats?.following || 0}</strong>
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
          className={activeTab === "feelings" ? styles.active : ""}
          onClick={() => handleTabChange("feelings")}
        >
          Feelings
        </button>
        <button
          className={activeTab === "feeds" ? styles.active : ""}
          onClick={() => handleTabChange("feeds")}
        >
          Feeds
        </button>
        <button
          className={activeTab === "likes" ? styles.active : ""}
          onClick={() => handleTabChange("likes")}
        >
          Beğenilenler
        </button>
        <button
          className={activeTab === "tags" ? styles.active : ""}
          onClick={() => handleTabChange("tags")}
        >
          Etiketliler
        </button>
      </div>

      <div className={styles.tabContent}>
        {loadingContent[activeTab] ? (
          <LoadingOverlay />
        ) : currentData.length > 0 ? (
          <div
            className={`${styles.section} ${
              activeTab === "feeds" ? styles.feedsGrid : ""
            }`}
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
          currentUserId={currentUser.uid}
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
            {/* ✅ KRİTİK DÜZELTME: Yeni FeedVideoCard kullanılıyor */}
            <FeedVideoCard
              data={selectedVideo} // Tüm veriyi tek bir 'data' prop'u ile gönderiyoruz
              onClose={handleCloseVideoModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountBox;