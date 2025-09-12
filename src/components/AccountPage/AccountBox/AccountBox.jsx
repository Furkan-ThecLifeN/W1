import React, { useState, useEffect } from "react";
import { IoIosSettings } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import styles from "./AccountBox.module.css";
import { useUser } from "../../../context/UserContext";
import { useAuth } from "../../../context/AuthProvider"; // Hata yönetimi için eklendi
import LoadingOverlay from "../../LoadingOverlay/LoadingOverlay";
import ConnectionsModal from "../../ConnectionsModal/ConnectionsModal";
import { db } from "../../../config/firebase-client";
import {
  collection,
  query,
  getDocs,
  orderBy,
  limit,
  startAfter,
  where,
} from "firebase/firestore";

import PostCard from "../Box/PostBox/PostBox";
import TweetCard from "../Box/FeelingsBox/FeelingsBox";
import VideoFeedItem from "../Box/VideoFeedItem/VideoFeedItem";
import VideoThumbnail from "../Box/VideoFeedItem/VideoThumbnail/VideoThumbnail";

// --------------------- Main Component ---------------------

const AccountBox = () => {
  const { currentUser, loading } = useUser();
  const { showToast } = useAuth(); // Hata bildirimleri için useAuth hook'u kullanılıyor
  const [activeTab, setActiveTab] = useState("posts");
  const [data, setData] = useState([]);
  const [loadingContent, setLoadingContent] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const ITEMS_PER_PAGE = 10;

  // ---------------- FETCH CONTENT ----------------
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
      // 🔹 Hangi koleksiyondan veri çekileceğini belirle
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
          userFilterField = "ownerId"; // Feeds için filtreleme alanını ownerId olarak belirle
          break;
        case "likes":
        case "tags":
          // Not: 'likes' ve 'tags' için bu koleksiyon yolu, veri yapınıza bağlı olarak
          // farklılık gösterebilir. Örneğin, global bir `likes` koleksiyonunda
          // `uid` alanına göre filtreleme yapmak daha yaygın olabilir.
          collectionName = `users/${currentUser.uid}/${type}`;
          userFilterField = null; // Bu koleksiyonlar zaten kullanıcıya özel
          break;
        default:
          collectionName = `users/${currentUser.uid}/${type}`;
          userFilterField = null;
          break;
      }
      
      // 🚨 ÖNEMLİ: Eğer `globalPosts` veya `globalFeeds` koleksiyonlarında `uid` ve `createdAt` alanlarını
      // birlikte kullanıyorsanız, Firebase konsolunda bu alanlar için bir birleşik dizin (composite index)
      // oluşturmanız gerekir. Aksi halde kodunuz hata verecektir.
      
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
      console.error("🔥 Veri çekme hatası:", error);
      // Hata mesajını kullanıcıya göster
      if (error.code === 'failed-precondition') {
        // Dizin hatası için özel mesaj
        const indexMessage = "Dizin hatası: İçerikleri görüntülemek için Firebase'de gerekli dizinlerin oluşturulması gerekiyor. Lütfen konsolu kontrol edin.";
        showToast(indexMessage, "error");
        console.error(indexMessage);
      } else {
        // Diğer genel hatalar için mesaj
        const generalMessage = "İçerikler yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.";
        showToast(generalMessage, "error");
        console.error("Genel hata:", error.message);
      }
    } finally {
      setLoadingContent(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchContent(activeTab, true);
    }
  }, [activeTab, currentUser]);

  // ---------------- HANDLERS ----------------
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

  const { uid, username, displayName, photoURL, bio, familySystem, stats } =
    currentUser;

  const handleStatClick = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  // ---------------- CARD COMPONENT SWITCH ----------------
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

  // ---------------- RENDER ----------------
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
            <strong>{stats?.posts || 0}</strong>
            <span className={styles.statLabel}>Post</span>
          </div>
          <div className={styles.statBox}>
            <strong>{stats?.rta || 0}</strong>
            <span className={styles.statLabel}>RTA</span>
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
        ) : data.length > 0 ? (
          <div
            className={`${styles.section} ${
              activeTab === "feeds" ? styles.feedsGrid : ""
            }`}
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
