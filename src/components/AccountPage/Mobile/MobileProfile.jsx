import React, { useState, useEffect } from "react";
import { IoIosSettings } from "react-icons/io";
import styles from "./MobileProfile.module.css";
import { Link } from "react-router-dom";
import { useUser } from "../../../context/UserContext";
import { useAuth } from "../../../context/AuthProvider";
import LoadingOverlay from "../../LoadingOverlay/LoadingOverlay";
import ConnectionsModal from "../../ConnectionsModal/ConnectionsModal";
import { db } from "../../../config/firebase-client";
import { collection, query, getDocs, orderBy, where } from "firebase/firestore";
import { useMobileProfileStore } from "../../../Store/useMobileProfileStore";

import PostCard from "../../Post/PostCard";
import TweetCard from "../../TweetCard/TweetCard";
import PostThumbnail from "../Box/PostThumbnail/PostThumbnail";
import VideoThumbnail from "../Box/VideoThumbnail/VideoThumbnail";
import FeedVideoCard from "../../Feeds/FeedVideoCard/FeedVideoCard";
import Footer from "../../Footer/Footer";

const MobileProfile = () => {
  const { currentUser, loading } = useUser();
  const { showToast } = useAuth();

  const { allData, postCounts, setAllData, setPostCounts, loadedTabs } =
    useMobileProfileStore();

  const [activeTab, setActiveTab] = useState("posts");
  const [loadingContent, setLoadingContent] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    const fetchPostCounts = async () => {
      if (!currentUser?.uid) return;
      try {
        // ✅ DEĞİŞİKLİK: Sorgular artık global yerine kullanıcının alt koleksiyonlarına yapılıyor
        const postsQuery = query(
          collection(db, "users", currentUser.uid, "posts")
        );
        const feelingsQuery = query(
          collection(db, "users", currentUser.uid, "feelings")
        );
        const feedsQuery = query(
          collection(db, "users", currentUser.uid, "feeds")
        );

        const [postsSnapshot, feelingsSnapshot, feedsSnapshot] =
          await Promise.all([
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

    if (currentUser) fetchPostCounts();
  }, [currentUser, setPostCounts]);

  useEffect(() => {
    const fetchTabData = async () => {
      if (!currentUser?.uid) return;
      if (loadedTabs[activeTab]) return; // ✅ ZATEN YÜKLENDİYSE FIRESTORE İSTEĞİ YOK

      setLoadingContent((prev) => ({ ...prev, [activeTab]: true }));
      try {
        const processSnapshot = (snapshot, type) =>
          snapshot.docs.map((doc) => {
            const itemData = { id: doc.id, ...doc.data() };
            if (["posts", "feelings"].includes(type)) {
              return {
                ...itemData,
                displayName: currentUser.displayName,
                username: currentUser.username,
                photoURL: currentUser.photoURL,
              };
            }
            if (type === "feeds") {
              return {
                ...itemData,
                displayName: currentUser.displayName,
                username: currentUser.username,
                photoURL: currentUser.photoURL,
                userProfileImage: currentUser.photoURL,
              };
            }
            // 'likes' ve 'tags' için gelen veriyi doğrudan döndür
            if (["likes", "tags"].includes(type)) {
              return itemData;
            }
            return itemData;
          });

        const [likesSnapshot, tagsSnapshot] = await Promise.all([
          getDocs(collection(db, "users", currentUser.uid, "likes")),
          getDocs(collection(db, "users", currentUser.uid, "tags")),
        ]);
        const likedIds = likesSnapshot.docs.map((doc) => doc.id);
        const savedIds = tagsSnapshot.docs.map((doc) => doc.id);

        let snapshot;
        switch (activeTab) {
          case "posts":
            // ✅ DEĞİŞİKLİK: globalPosts yerine kullanıcının alt koleksiyonu
            snapshot = await getDocs(
              query(
                collection(db, "users", currentUser.uid, "posts"),
                orderBy("createdAt", "desc")
              )
            );
            setAllData(activeTab, processSnapshot(snapshot, activeTab));
            break;
          case "feelings":
            // ✅ DEĞİŞİKLİK: globalFeelings yerine kullanıcının alt koleksiyonu
            snapshot = await getDocs(
              query(
                collection(db, "users", currentUser.uid, "feelings"),
                orderBy("createdAt", "desc")
              )
            );
            setAllData(activeTab, processSnapshot(snapshot, activeTab));
            break;
          case "feeds":
            // ✅ DEĞİŞİKLİK: globalFeeds yerine kullanıcının alt koleksiyonu
            snapshot = await getDocs(
              query(
                collection(db, "users", currentUser.uid, "feeds"),
                orderBy("createdAt", "desc")
              )
            );
            setAllData(activeTab, processSnapshot(snapshot, activeTab));
            break;
          case "likes":
            // Beğenilenler (likes) ve kaydedilenler (tags) mantığı global koleksiyondan
            // okumaya devam etmeli, çünkü kullanıcı başkalarının gönderilerini beğenebilir.
            if (likedIds.length > 0) {
              const likedQuery = query(
                collection(db, "globalPosts"),
                where("__name__", "in", likedIds.slice(0, 10))
              );
              const likedSnap = await getDocs(likedQuery);
              setAllData(activeTab, processSnapshot(likedSnap, activeTab));
            } else setAllData(activeTab, []);
            break;
          case "tags":
            if (savedIds.length > 0) {
              const taggedQuery = query(
                collection(db, "globalPosts"),
                where("__name__", "in", savedIds.slice(0, 10))
              );
              const taggedSnap = await getDocs(taggedQuery);
              setAllData(activeTab, processSnapshot(taggedSnap, activeTab));
            } else setAllData(activeTab, []);
            break;
          default:
            setAllData(activeTab, []);
            break;
        }
      } catch (error) {
        console.error(`🔥 Veri çekilirken hata oluştu (${activeTab}):`, error);
        showToast("Veriler yüklenirken bir sorun oluştu.", "error");
      } finally {
        setLoadingContent((prev) => ({ ...prev, [activeTab]: false }));
      }
    };

    fetchTabData();
  }, [activeTab, currentUser, setAllData, loadedTabs, showToast]);

  const handleTabChange = (tabName) => setActiveTab(tabName);

  const handleVideoClick = (videoData) => {
    const fullData = {
      ...videoData,
      displayName: currentUser.displayName,
      username: currentUser.username,
      photoURL: currentUser.photoURL,
      userProfileImage: currentUser.photoURL,
    };
    setSelectedVideo(fullData);
    setShowVideoModal(true);
  };

  const handleCloseVideoModal = () => {
    setShowVideoModal(false);
    setSelectedVideo(null);
  };

  const handlePostClick = (postData) => {
    const fullData = {
      ...postData,
      displayName: currentUser.displayName,
      username: currentUser.username,
      photoURL: currentUser.photoURL,
    };
    setSelectedPost(fullData);
    setShowPostModal(true);
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

  const getCardComponent = (item) => {
    switch (activeTab) {
      case "posts":
      case "likes":
      case "tags":
        return (
          <PostThumbnail
            key={item.id}
            data={item}
            onClick={() => handlePostClick(item)}
          />
        );
      case "feelings":
        return <TweetCard key={item.id} data={item} />;
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
    /* { key: "likes", label: "Beğenilenler" },
    { key: "tags", label: "Etiketliler" }, */
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
              <span className={styles.statNumber}>
                {postCounts.posts + postCounts.feelings + postCounts.feeds}
              </span>
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
              <span className={styles.statNumber}>
                {currentUser.stats?.followers || 0}
              </span>
              <span className={styles.statLabel}>Followers</span>
            </div>
            <div
              className={styles.stat}
              onClick={() => handleStatClick("following")}
              style={{ cursor: "pointer" }}
            >
              <span className={styles.statNumber}>
                {currentUser.stats?.following || 0}
              </span>
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
            className={
              activeTab === "feelings"
                ? styles.feelingsGrid
                : activeTab === "feeds"
                ? styles.feedsGrid
                : styles.postsGrid
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
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileProfile;
