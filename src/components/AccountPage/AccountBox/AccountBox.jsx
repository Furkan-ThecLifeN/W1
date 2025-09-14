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

import PostCard from "../Box/PostBox/PostBox";
import TweetCard from "../Box/FeelingsBox/FeelingsBox";
import VideoFeedItem from "../Box/VideoFeedItem/VideoFeedItem";
import VideoThumbnail from "../Box/VideoFeedItem/VideoThumbnail/VideoThumbnail";

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
  const [loadingContent, setLoadingContent] = useState(false);
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
  // Bu fonksiyon sadece sayıları çekmek için bir kez çalışır.
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

  // ---------------- FETCH ALL CONTENT ----------------
  const fetchAllUserData = async () => {
    if (!currentUser || !currentUser.uid) return;

    setLoadingContent(true);

    try {
      // Tüm verileri paralel olarak çekiyoruz
      const [
        postsSnapshot,
        feelingsSnapshot,
        feedsSnapshot,
        likesSnapshot,
        tagsSnapshot,
      ] = await Promise.all([
        getDocs(query(collection(db, "globalPosts"), where("uid", "==", currentUser.uid), orderBy("createdAt", "desc"))),
        getDocs(query(collection(db, "globalFeelings"), where("uid", "==", currentUser.uid), orderBy("createdAt", "desc"))),
        getDocs(query(collection(db, "globalFeeds"), where("ownerId", "==", currentUser.uid), orderBy("createdAt", "desc"))),
        getDocs(query(collection(db, "users", currentUser.uid, "likes"), orderBy("createdAt", "desc"))),
        getDocs(query(collection(db, "users", currentUser.uid, "tags"), orderBy("createdAt", "desc"))),
      ]);

      const likedPostIds = likesSnapshot.docs.map(doc => doc.id);
      const taggedPostIds = tagsSnapshot.docs.map(doc => doc.id);

      const processSnapshot = (snapshot, type) => {
        let data = snapshot.docs.map(doc => {
          const item = { id: doc.id, ...doc.data() };
          // Beğeni/Kaydetme durumlarını veriye ekle
          item.initialLiked = likedPostIds.includes(item.id);
          item.initialSaved = taggedPostIds.includes(item.id);
          return item;
        });
        if (type === "feeds") {
          data = data.filter(item => item.mediaUrl);
        }
        return data;
      };

      setAllData({
        posts: processSnapshot(postsSnapshot, 'posts'),
        feelings: processSnapshot(feelingsSnapshot, 'feelings'),
        feeds: processSnapshot(feedsSnapshot, 'feeds'),
        likes: processSnapshot(likesSnapshot, 'likes'),
        tags: processSnapshot(tagsSnapshot, 'tags'),
      });

    } catch (error) {
      console.error("🔥 Tüm veriler çekilirken hata oluştu:", error);
      if (error.code === 'failed-precondition') {
        const indexMessage = "Dizin hatası: İçerikleri görüntülemek için Firebase'de gerekli dizinlerin oluşturulması gerekiyor. Lütfen konsolu kontrol edin.";
        showToast(indexMessage, "error");
      } else {
        const generalMessage = "Veriler yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.";
        showToast(generalMessage, "error");
      }
    } finally {
      setLoadingContent(false);
    }
  };

  // Sadece bileşen yüklendiğinde ve currentUser değiştiğinde çalışır
  useEffect(() => {
    if (currentUser) {
      fetchAllUserData();
    }
  }, [currentUser]);

  // ---------------- HANDLERS ----------------
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    // Artık sekme değiştiğinde yeni bir istek ATMIYORUZ.
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

  // ---------------- CARD COMPONENT SWITCH ----------------
  const getCardComponent = (item) => {
    const initialLiked = item?.initialLiked ?? false;
    const initialSaved = item?.initialSaved ?? false;

    switch (activeTab) {
      case "posts":
        return <PostCard key={item.id} post={item} initialLiked={initialLiked} initialSaved={initialSaved} />;
      case "feelings":
        return <TweetCard key={item.id} feeling={item} initialLiked={initialLiked} initialSaved={initialSaved} />;
      case "feeds":
        return (
          <VideoThumbnail
            key={item.id}
            mediaUrl={item.mediaUrl}
            onClick={() => handleVideoClick(item)}
          />
        );
      case "likes":
      case "tags":
        // Bu sekmeler için direkt alınan veriyi kullanıyoruz
        return <PostCard key={item.id} post={item} initialLiked={activeTab === 'likes'} initialSaved={activeTab === 'tags'} />;
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

  // ---------------- RENDER ----------------
  const currentData = allData[activeTab] || [];

  return (
    <div className={styles.pageWrapper}>
      {/* Top */}
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

      {/* Profile Info */}
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
            <strong>{postCounts.posts}</strong>
            <span className={styles.statLabel}>Post</span>
          </div>
          <div className={styles.statBox}>
            <strong>{postCounts.feelings}</strong>
            <span className={styles.statLabel}>Feelings</span>
          </div>
          <div className={styles.statBox}>
            <strong>{postCounts.feeds}</strong>
            <span className={styles.statLabel}>Feeds</span>
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

      {/* Tab Bar */}
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

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {loadingContent ? (
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

      {/* Modals */}
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

export default AccountBox;