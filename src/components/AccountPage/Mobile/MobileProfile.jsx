import React, { useState, useEffect } from "react";
import { IoIosSettings } from "react-icons/io";
import styles from "./MobileProfile.module.css";
import { Link } from "react-router-dom";
import { useUser } from "../../../context/UserContext";
import LoadingOverlay from "../../LoadingOverlay/LoadingOverlay";
import ConnectionsModal from "../../ConnectionsModal/ConnectionsModal";
import { db } from "../../../config/firebase-client";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  where,
} from "firebase/firestore";

import PostCard from "../Box/PostBox/PostBox";
import TweetCard from "../Box/FeelingsBox/FeelingsBox";
import VideoThumbnail from "../Box/VideoFeedItem/VideoThumbnail/VideoThumbnail";
import VideoFeedItem from "../Box/VideoFeedItem/VideoFeedItem";

const MobileProfile = () => {
  const { currentUser, loading } = useUser();
  const [activeTab, setActiveTab] = useState("posts");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [data, setData] = useState([]);
  const [loadingContent, setLoadingContent] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const ITEMS_PER_PAGE = 10;

  const fetchContent = async (type, isInitialLoad = true) => {
    if (!currentUser || !currentUser.uid) return;

    setLoadingContent(true);
    let q;

    if (isInitialLoad) {
      setData([]);
      setLastVisible(null);
      setHasMore(true);
    }

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
          collectionName = `users/${currentUser.uid}/${type}`;
          userFilterField = null;
          break;
        default:
          collectionName = `users/${currentUser.uid}/${type}`;
          userFilterField = null;
          break;
      }
      
      let queryRef = collection(db, collectionName);

      if (userFilterField) {
        queryRef = query(
          queryRef,
          where(userFilterField, "==", currentUser.uid),
          orderBy("createdAt", "desc")
        );
      } else {
        queryRef = query(
          queryRef,
          orderBy("createdAt", "desc")
        );
      }

      q = query(
        queryRef,
        ...(isInitialLoad
          ? [limit(ITEMS_PER_PAGE)]
          : [startAfter(lastVisible), limit(ITEMS_PER_PAGE)])
      );

      if (!isInitialLoad && !lastVisible) {
        setLoadingContent(false);
        return;
      }

      const querySnapshot = await getDocs(q);
      const fetchedData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      let filteredData = fetchedData;
      if (type === "feeds") {
        filteredData = fetchedData.filter((item) => item.mediaUrl);
      }

      setData((prevData) => {
        const newData = filteredData.filter(
          (item) => !prevData.some((existingItem) => existingItem.id === item.id)
        );
        return [...prevData, ...newData];
      });

      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setHasMore(fetchedData.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error("Veri çekme hatası:", error);
      // Hata yönetimi burada eklenebilir, AccountBox'ta olduğu gibi
    } finally {
      setLoadingContent(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchContent(activeTab, true);
    }
  }, [activeTab, currentUser]);

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

  if (loading) return <LoadingOverlay />;
  if (!currentUser) return <div>Lütfen giriş yapın.</div>;

  const { username, displayName, photoURL, bio, familySystem, stats, uid } =
    currentUser;

  const handleStatClick = (type) => {
    setModalType(type);
    setShowModal(true);
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
    { key: "likes", label: "Liked" },
    { key: "tags", label: "Tagged" },
  ];

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
              <span className={styles.statNumber}>{stats.posts}</span>
              <span className={styles.statLabel}>Posts</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{stats.rta}</span>
              <span className={styles.statLabel}>RTA</span>
            </div>
          </div>
          <div className={styles.stat_content}>
            <div
              className={styles.stat}
              onClick={() => handleStatClick("followers")}
              style={{ cursor: "pointer" }}
            >
              <span className={styles.statNumber}>{stats.followers}</span>
              <span className={styles.statLabel}>Followers</span>
            </div>
            <div
              className={styles.stat}
              onClick={() => handleStatClick("following")}
              style={{ cursor: "pointer" }}
            >
              <span className={styles.statNumber}>{stats.following}</span>
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
        {loadingContent ? (
          <LoadingOverlay />
        ) : data.length > 0 ? (
          <div
            className={
              activeTab === "feelings"
                ? styles.feelingsGrid
                : activeTab === "feeds"
                ? styles.feedsGrid
                : styles.postsGrid
            }
          >
            {data.map(getCardComponent)}
            {hasMore && (
              <div className={styles.loadMoreContainer}>
                <button
                  onClick={() => fetchContent(activeTab, false)}
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

      {showModal && (
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
            <VideoFeedItem
              videoSrc={selectedVideo.mediaUrl}
              description={selectedVideo.content}
              username={selectedVideo.username}
              userProfileImage={selectedVideo.userProfileImage}
              onClose={handleCloseVideoModal}
              isMobile={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileProfile;