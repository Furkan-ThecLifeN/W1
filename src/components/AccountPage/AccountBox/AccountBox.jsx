import React, { useState, useEffect } from "react";
import { IoIosSettings } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import styles from "./AccountBox.module.css";
import { useUser } from "../../../context/UserContext";
import { useAuth } from "../../../context/AuthProvider";
import LoadingOverlay from "../../LoadingOverlay/LoadingOverlay";
import ConnectionsModal from "../../ConnectionsModal/ConnectionsModal";
import { db } from "../../../config/firebase-client";
import { collection, query, getDocs, orderBy, where } from "firebase/firestore";

import PostCard from "../../Post/PostCard";
import TweetCard from "../../TweetCard/TweetCard";
import VideoThumbnail from "../Box/VideoThumbnail/VideoThumbnail";
import FeedVideoCard from "../../Feeds/FeedVideoCard/FeedVideoCard";

import { useProfileStore } from "../../../Store/useProfileStore";

const AccountBox = () => {
  const { currentUser, loading } = useUser();
  const { showToast } = useAuth();
  const navigate = useNavigate();

  const { profileData, posts, feelings, feeds, likes, tags, isLoaded, setState } = useProfileStore();

  const [activeTab, setActiveTab] = useState("posts");
  const [loadingContent, setLoadingContent] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [postCounts, setPostCounts] = useState({ posts: 0, feelings: 0, feeds: 0 });

  // Profil verisini store’a yaz
  useEffect(() => {
    if (!currentUser) return;
    setState({ profileData: currentUser });
  }, [currentUser, setState]);

  // Gönderi sayılarını çek
  useEffect(() => {
    if (!currentUser?.uid) return;

    const fetchPostCounts = async () => {
      try {
        const postsQuery = query(collection(db, "globalPosts"), where("uid", "==", currentUser.uid));
        const feelingsQuery = query(collection(db, "globalFeelings"), where("uid", "==", currentUser.uid));
        const feedsQuery = query(collection(db, "globalFeeds"), where("ownerId", "==", currentUser.uid));

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
        console.error("Gönderi sayıları çekilirken hata:", error);
      }
    };

    fetchPostCounts();
  }, [currentUser]);

  // Tab içeriğini fetch et
  const fetchTabData = async (tab) => {
    if (!currentUser?.uid || isLoaded[tab]) return;

    setLoadingContent((prev) => ({ ...prev, [tab]: true }));

    try {
      let snapshot;
      let queryToRun;

      const processSnapshot = (snapshot, type) =>
        snapshot.docs.map((doc) => {
          const itemData = { id: doc.id, ...doc.data() };
          if (["posts", "feelings"].includes(type)) {
            return { ...itemData, displayName: currentUser.displayName, username: currentUser.username, photoURL: currentUser.photoURL };
          }
          if (type === "feeds") {
            return { ...itemData, displayName: currentUser.displayName, username: currentUser.username, photoURL: currentUser.photoURL, userProfileImage: currentUser.photoURL };
          }
          return itemData;
        });

      const [likesSnapshot, tagsSnapshot] = await Promise.all([
        getDocs(collection(db, "users", currentUser.uid, "likes")),
        getDocs(collection(db, "users", currentUser.uid, "tags")),
      ]);

      const likedIds = likesSnapshot.docs.map((doc) => doc.id);
      const savedIds = tagsSnapshot.docs.map((doc) => doc.id);

      switch (tab) {
        case "posts":
          queryToRun = query(collection(db, "globalPosts"), where("uid", "==", currentUser.uid), orderBy("createdAt", "desc"));
          snapshot = await getDocs(queryToRun);
          setState({ posts: processSnapshot(snapshot, tab), isLoaded: { ...isLoaded, posts: true } });
          break;
        case "feelings":
          queryToRun = query(collection(db, "globalFeelings"), where("uid", "==", currentUser.uid), orderBy("createdAt", "desc"));
          snapshot = await getDocs(queryToRun);
          setState({ feelings: processSnapshot(snapshot, tab), isLoaded: { ...isLoaded, feelings: true } });
          break;
        case "feeds":
          queryToRun = query(collection(db, "globalFeeds"), where("ownerId", "==", currentUser.uid), orderBy("createdAt", "desc"));
          snapshot = await getDocs(queryToRun);
          setState({ feeds: processSnapshot(snapshot, tab), isLoaded: { ...isLoaded, feeds: true } });
          break;
        case "likes":
          if (likedIds.length > 0) {
            const likedPostsQuery = query(collection(db, "globalPosts"), where("__name__", "in", likedIds.slice(0, 30)));
            const likedPostsSnapshot = await getDocs(likedPostsQuery);
            setState({ likes: processSnapshot(likedPostsSnapshot, tab), isLoaded: { ...isLoaded, likes: true } });
          } else {
            setState({ likes: [], isLoaded: { ...isLoaded, likes: true } });
          }
          break;
        case "tags":
          if (savedIds.length > 0) {
            const taggedPostsQuery = query(collection(db, "globalPosts"), where("__name__", "in", savedIds.slice(0, 30)));
            const taggedPostsSnapshot = await getDocs(taggedPostsQuery);
            setState({ tags: processSnapshot(taggedPostsSnapshot, tab), isLoaded: { ...isLoaded, tags: true } });
          } else {
            setState({ tags: [], isLoaded: { ...isLoaded, tags: true } });
          }
          break;
        default:
          break;
      }
    } catch (err) {
      console.error(`Veri çekilirken hata (${tab}):`, err);
      showToast("Veriler yüklenirken bir sorun oluştu", "error");
    } finally {
      setLoadingContent((prev) => ({ ...prev, [tab]: false }));
    }
  };

  useEffect(() => {
    fetchTabData(activeTab);
  }, [activeTab, currentUser]);

  const handleTabChange = (tabName) => setActiveTab(tabName);

  const handleVideoClick = (videoData) => {
    setSelectedVideo({ ...videoData, displayName: currentUser.displayName, username: currentUser.username, photoURL: currentUser.photoURL, userProfileImage: currentUser.photoURL });
    setShowVideoModal(true);
  };
  const handleCloseVideoModal = () => setShowVideoModal(false);

  if (loading) return <LoadingOverlay />;
  if (!currentUser) return <div>Lütfen giriş yapın.</div>;

  const { username, displayName, photoURL, bio, familySystem, stats } = currentUser;

  const handleStatClick = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  const getCardComponent = (item) => {
    switch (activeTab) {
      case "posts":
      case "likes":
      case "tags":
        return <PostCard key={item.id} data={item} />;
      case "feelings":
        return <TweetCard key={item.id} data={item} />;
      case "feeds":
        return <VideoThumbnail key={item.id} mediaUrl={item.mediaUrl} onClick={() => handleVideoClick(item)} />;
      default:
        return null;
    }
  };

  const emptyMessage = () => {
    switch (activeTab) {
      case "posts": return `${displayName || username}, henüz bir gönderi paylaşmadınız.`;
      case "feelings": return `${displayName || username}, henüz bir duygu paylaşmadınız.`;
      case "feeds": return `${displayName || username}, henüz feed'leriniz bulunmamaktadır.`;
      case "likes": return `${displayName || username}, henüz bir gönderiyi beğenmediniz.`;
      case "tags": return `${displayName || username}, henüz etiketlendiğiniz bir gönderi bulunmamaktadır.`;
      default: return `Henüz bir içerik bulunmamaktadır.`;
    }
  };

  const dataMap = { posts, feelings, feeds, likes, tags };
  const currentData = dataMap[activeTab] || [];

  return (
    <div className={styles.pageWrapper}>
      {/* PROFİL ÜST */}
      <div className={styles.account_top}>
        <div className={styles.fixedTopBox}>{username}</div>
        <div className={styles.fixedSettingsBtn}>
          <button className={styles.actionBtn} onClick={() => navigate("/settings")}>
            <IoIosSettings className={styles.icon} />
          </button>
        </div>
      </div>

      {/* PROFİL DETAY */}
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
          <div className={styles.bio}>{bio || "Henüz bir biyografi eklemediniz."}</div>
        </div>

        <div className={styles.statsSection}>
          <div className={styles.statBox}>
            <strong>{postCounts.posts + postCounts.feelings + postCounts.feeds}</strong>
            <span className={styles.statLabel}>Posts</span>
          </div>
          <div className={styles.statBox} onClick={() => handleStatClick("followers")}>
            <strong>{stats?.followers || 0}</strong>
            <span className={styles.statLabel}>Followers</span>
          </div>
          <div className={styles.statBox} onClick={() => handleStatClick("following")}>
            <strong>{stats?.following || 0}</strong>
            <span className={styles.statLabel}>Following</span>
          </div>
        </div>
      </div>

      {/* TAB BAR */}
      <div className={styles.tabBar}>
        <button className={activeTab === "posts" ? styles.active : ""} onClick={() => handleTabChange("posts")}>Posts</button>
        <button className={activeTab === "feelings" ? styles.active : ""} onClick={() => handleTabChange("feelings")}>Feelings</button>
        <button className={activeTab === "feeds" ? styles.active : ""} onClick={() => handleTabChange("feeds")}>Feeds</button>
        <button className={activeTab === "likes" ? styles.active : ""} onClick={() => handleTabChange("likes")}>Beğenilenler</button>
        <button className={activeTab === "tags" ? styles.active : ""} onClick={() => handleTabChange("tags")}>Etiketliler</button>
      </div>

      {/* TAB CONTENT */}
      <div className={styles.tabContent}>
        {loadingContent[activeTab] ? (
          <LoadingOverlay />
        ) : currentData.length > 0 ? (
          <div className={`${styles.section} ${activeTab === "feeds" ? styles.feedsGrid : ""}`}>
            {currentData.map(getCardComponent)}
          </div>
        ) : (
          <div className={styles.emptyState}>{emptyMessage()}</div>
        )}
      </div>

      {/* MODAL */}
      {showModal && currentUser && (
        <ConnectionsModal show={showModal} onClose={() => setShowModal(false)} listType={modalType} currentUserId={currentUser.uid} />
      )}

      {showVideoModal && selectedVideo && (
        <div className={styles.videoModalOverlay} onClick={handleCloseVideoModal}>
          <div className={styles.videoModalContent} onClick={(e) => e.stopPropagation()}>
            <FeedVideoCard data={selectedVideo} onClose={handleCloseVideoModal} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountBox;
