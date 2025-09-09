import React, { useState, useEffect } from "react";
import { IoIosSettings } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import styles from "./AccountBox.module.css";
import { useUser } from "../../../context/UserContext";
import LoadingOverlay from "../../LoadingOverlay/LoadingOverlay"; // 👈 LoadingOverlay'i içe aktarıyoruz
import ConnectionsModal from "../../ConnectionsModal/ConnectionsModal";
import { db } from "../../../config/firebase-client";
import {
  collection,
  query,
  getDocs,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";

// Yeni tasarımlı kart bileşenlerini içeri aktarıyoruz
import PostCard from "../Box/PostBox/PostBox";
import TweetCard from "../Box/FeelingsBox/FeelingsBox";
import PostVideoCard from "../../Feeds/PostVideoCard/PostVideoCard";

// --------------------- Main Component ---------------------

const AccountBox = () => {
  const { currentUser, loading } = useUser();
  const [activeTab, setActiveTab] = useState("posts");
  const [data, setData] = useState([]);
  const [loadingContent, setLoadingContent] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);

  const ITEMS_PER_PAGE = 10;

  const fetchContent = async (type, isInitialLoad = true) => {
    if (!currentUser || !currentUser.uid) return;

    setLoadingContent(true);
    let collectionPath = `users/${currentUser.uid}/${type}`;
    let q;

    if (isInitialLoad) {
      // İlk yüklemede veriyi tamamen sıfırla
      setData([]);
      setLastVisible(null);
      setHasMore(true);
      q = query(
        collection(db, collectionPath),
        orderBy("createdAt", "desc"),
        limit(ITEMS_PER_PAGE)
      );
    } else {
      // Sonraki yüklemeler için lastVisible'ı kontrol et
      if (!lastVisible) {
        setLoadingContent(false);
        return;
      }
      q = query(
        collection(db, collectionPath),
        orderBy("createdAt", "desc"),
        startAfter(lastVisible),
        limit(ITEMS_PER_PAGE)
      );
    }

    try {
      const querySnapshot = await getDocs(q);
      const fetchedData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Önceki verilerle yeni verileri birleştir, ancak benzersizlik kontrolü yap
      setData((prevData) => {
        const newData = fetchedData.filter(
          (item) =>
            !prevData.some((existingItem) => existingItem.id === item.id)
        );
        return [...prevData, ...newData];
      });

      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setHasMore(fetchedData.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error("Veri çekme hatası:", error);
    } finally {
      setLoadingContent(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      // Sekme değiştiğinde fetchContent'i ilk yükleme olarak çağır
      fetchContent(activeTab, true);
    }
  }, [activeTab, currentUser]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    // State sıfırlama işlemi artık fetchContent içinde yapılıyor
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

  const getCardComponent = (item) => {
    switch (activeTab) {
      case "posts":
        return <PostCard key={item.id} post={item} />;
      case "feelings":
        return <TweetCard key={item.id} feeling={item} />;
      case "feeds":
        // Bu props yapısını PostVideoCard bileşeninizin iç yapısına göre düzenlemeniz gerekebilir.
        return <PostVideoCard key={item.id} feed={item} />;
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
            <strong>{stats.posts}</strong>
            <span className={styles.statLabel}>Post</span>
          </div>
          <div className={styles.statBox}>
            <strong>{stats.rta}</strong>
            <span className={styles.statLabel}>RTA</span>
          </div>
          <div
            className={styles.statBox}
            onClick={() => handleStatClick("followers")}
          >
            <strong>{stats.followers}</strong>
            <span className={styles.statLabel}>Takipçiler</span>
          </div>
          <div
            className={styles.statBox}
            onClick={() => handleStatClick("following")}
          >
            <strong>{stats.following}</strong>
            <span className={styles.statLabel}>Takip Edilen</span>
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
        {/* Kontent yüklenirken veya boşken LoadingOverlay'i göster */}
        {loadingContent ? (
          <LoadingOverlay />
        ) : data.length > 0 ? (
          <div className={styles.section}>
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

      {showModal && currentUser && (
        <ConnectionsModal
          show={showModal}
          onClose={() => setShowModal(false)}
          listType={modalType}
          currentUserId={currentUser.uid}
        />
      )}
    </div>
  );
};

export default AccountBox;