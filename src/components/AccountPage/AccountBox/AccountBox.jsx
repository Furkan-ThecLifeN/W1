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

import PostCard from "../../Post/PostCard";
import TweetCard from "../../TweetCard/TweetCard";
import VideoThumbnail from "../Box/VideoThumbnail/VideoThumbnail";
import FeedVideoCard from "../../Feeds/FeedVideoCard/FeedVideoCard";

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

  // Gönderi sayılarını çeken useEffect (Değişiklik yok)
  useEffect(() => {
    const fetchPostCounts = async () => {
      if (!currentUser?.uid) return;
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
        console.error("Gönderi sayıları çekilirken hata oluştu:", error);
      }
    };
    if (currentUser) {
      fetchPostCounts();
    }
  }, [currentUser]);

  // Sekme içeriğini çeken useEffect (✅ GÜNCELLENDİ)
  useEffect(() => {
    const fetchTabData = async () => {
      if (!currentUser || !currentUser.uid) return;
      
      // ✅ DÜZELTME: Önbellekleme mantığı kaldırıldı, böylece currentUser değişince veriler yeniden çekilir.
      setLoadingContent(prev => ({ ...prev, [activeTab]: true }));

      try {
        let snapshot;
        let queryToRun;

        // ✅ GÜNCELLENMİŞ processSnapshot: Her kart tipi için doğru ve güncel profil bilgisini ekler.
        const processSnapshot = (snapshot, type) => {
          return snapshot.docs.map(doc => {
            const itemData = { id: doc.id, ...doc.data() };
            
            // Kendi gönderilerimiz için (posts, feelings)
            if (['posts', 'feelings'].includes(type)) {
              return {
                ...itemData,
                displayName: currentUser.displayName,
                username: currentUser.username,
                photoURL: currentUser.photoURL,
              };
            }
            // FeedVideoCard için özel prop ('userProfileImage') ekleniyor
            if (type === 'feeds') {
                return {
                    ...itemData,
                    displayName: currentUser.displayName,
                    username: currentUser.username,
                    photoURL: currentUser.photoURL,
                    userProfileImage: currentUser.photoURL, // FeedVideoCard bu prop'u bekliyor
                }
            }
            // Beğenilenler/etiketlenenler için (başkalarının gönderileri),
            // gönderinin kendi içindeki yazar bilgisini korur.
            return itemData;
          });
        };
        
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
             if (likedIds.length > 0) {
                 const likedPostsQuery = query(collection(db, "globalPosts"), where("__name__", "in", likedIds.slice(0, 30)));
                 const likedPostsSnapshot = await getDocs(likedPostsQuery);
                 setAllData(prev => ({ ...prev, [activeTab]: processSnapshot(likedPostsSnapshot, activeTab) }));
             } else {
                 setAllData(prev => ({ ...prev, [activeTab]: [] }));
             }
             break;
          case "tags":
             if (savedIds.length > 0) {
                 const taggedPostsQuery = query(collection(db, "globalPosts"), where("__name__", "in", savedIds.slice(0, 30)));
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
        showToast("Veriler yüklenirken bir sorun oluştu.", "error");
      } finally {
        setLoadingContent(prev => ({ ...prev, [activeTab]: false }));
      }
    };
    
    fetchTabData();
    
  }, [activeTab, currentUser]); // ✅ BAĞIMLILIK: `currentUser` nesnesinin tamamına bağlandı.

  const handleTabChange = (tabName) => setActiveTab(tabName);
  
  const handleVideoClick = (videoData) => {
    // ✅ DÜZELTME: Modal'a gönderilen veriye `userProfileImage` prop'u ekleniyor.
    const fullVideoData = {
        ...videoData,
        displayName: currentUser.displayName,
        username: currentUser.username,
        photoURL: currentUser.photoURL,
        userProfileImage: currentUser.photoURL, // Bu satır eklendi.
    };
    setSelectedVideo(fullVideoData);
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
      case "posts": return `${displayName || username}, henüz bir gönderi paylaşmadınız.`;
      case "feelings": return `${displayName || username}, henüz bir duygu paylaşmadınız.`;
      case "feeds": return `${displayName || username}, henüz feed'leriniz bulunmamaktadır.`;
      case "likes": return `${displayName || username}, henüz bir gönderiyi beğenmediniz.`;
      case "tags": return `${displayName || username}, henüz etiketlendiğiniz bir gönderi bulunmamaktadır.`;
      default: return `Henüz bir içerik bulunmamaktadır.`;
    }
  };

  const currentData = allData[activeTab] || [];

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.account_top}>
        <div className={styles.fixedTopBox}>{username}</div>
        <div className={styles.fixedSettingsBtn}>
          <button className={styles.actionBtn} onClick={() => navigate("/settings")}>
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

      <div className={styles.tabBar}>
        <button className={activeTab === "posts" ? styles.active : ""} onClick={() => handleTabChange("posts")}>Posts</button>
        <button className={activeTab === "feelings" ? styles.active : ""} onClick={() => handleTabChange("feelings")}>Feelings</button>
        <button className={activeTab === "feeds" ? styles.active : ""} onClick={() => handleTabChange("feeds")}>Feeds</button>
        <button className={activeTab === "likes" ? styles.active : ""} onClick={() => handleTabChange("likes")}>Beğenilenler</button>
        <button className={activeTab === "tags" ? styles.active : ""} onClick={() => handleTabChange("tags")}>Etiketliler</button>
      </div>

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

      {showModal && currentUser && (
        <ConnectionsModal
          show={showModal}
          onClose={() => setShowModal(false)}
          listType={modalType}
          currentUserId={currentUser.uid}
        />
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
