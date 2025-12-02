import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./StoryBar.module.css";
import StoryViewer from "../StoryViewer/StoryViewer";
import { useAuth } from "../../context/AuthProvider";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useStoryStore } from "../../Store/useStoryStore";

// ✅ 1. ADIM: Güvenilir bir varsayılan resim (Yedek)
const DEFAULT_AVATAR = "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";

const StoryBar = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const {
    feed: stories,
    myStory,
    loading,
    isLoaded,
    fetchStories,
  } = useStoryStore();

  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [initialUserIndex, setInitialUserIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    fetchStories(currentUser);
  }, [currentUser, fetchStories]);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [stories, myStory]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth / 2;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 300);
    }
  };

  const handleMyStoryClick = () => {
    if (myStory) {
      setInitialUserIndex(0);
      setIsViewerOpen(true);
    } else {
      navigate("/create/story");
    }
  };

  const handleOtherStoryClick = (index) => {
    const realIndex = myStory ? index + 1 : index;
    setInitialUserIndex(realIndex);
    setIsViewerOpen(true);
  };

  const getAllStories = () => {
    if (myStory) {
      return [myStory, ...stories];
    }
    return stories;
  };

  const showLoadingIndicator = loading && !isLoaded && stories.length === 0;

  const getMyStoryRingColor = () => {
    if (!myStory) return "transparent";
    if (myStory.allSeen) return "#555555";
    return "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)";
  };

  // ✅ 2. ADIM: Hata Yönetimi Fonksiyonu
  const handleImageError = (e) => {
    e.target.src = DEFAULT_AVATAR; // Resim yüklenemezse varsayılanı göster
  };

  return (
    <>
      <div className={styles.storyBarContainer}>
        
        {canScrollLeft && (
          <button 
            className={`${styles.navButton} ${styles.navButtonLeft}`} 
            onClick={() => scroll("left")}
          >
            <ChevronLeft size={20} />
          </button>
        )}

        <div 
          className={styles.storiesScroller} 
          ref={scrollRef}
          onScroll={checkScroll}
        >
          {/* --- KENDİ HİKAYEM --- */}
          <div className={styles.storyItem} onClick={handleMyStoryClick}>
            <div className={styles.avatarWrapper}>
              <div
                className={myStory ? styles.gradientRing : styles.noStoryRing}
                style={myStory ? { background: getMyStoryRingColor() } : {}}
              >
                <div className={styles.avatarInner}>
                  {/* ✅ 3. ADIM: Resim etiketi güncellendi */}
                  <img
                    src={currentUser?.photoURL || DEFAULT_AVATAR}
                    alt="Me"
                    className={styles.avatarImg}
                    onError={handleImageError} // Kırık link kontrolü
                    referrerPolicy="no-referrer" // 🔥 CANLI SİTE İÇİN KRİTİK AYAR
                    crossOrigin="anonymous"      // CORS desteği için
                  />
                </div>
              </div>
              
              {!myStory && (
                <div className={styles.plusBadge}>
                  <Plus size={14} color="#fff" />
                </div>
              )}
            </div>
            <span className={styles.username} style={{ color: myStory?.allSeen ? "#777" : "#fff" }}>
              Your Story
            </span>
          </div>

          {showLoadingIndicator && (
            <div className={styles.loadingItem}>
              <div className={styles.loadingSkeletonCircle}></div>
              <div className={styles.loadingSkeletonText}></div>
            </div>
          )}

          {/* --- ARKADAŞLAR --- */}
          {stories.map((storyGroup, index) => {
            let ringBackground;

            if (storyGroup.allSeen) {
              ringBackground = "#555555";
            } else {
              const hasCloseFriendStory = storyGroup.stories.some(s => s.privacy === "close_friendships");
              ringBackground = hasCloseFriendStory 
                ? "#4caf50" 
                : "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)";
            }

            return (
              <div
                key={storyGroup.user.uid}
                className={styles.storyItem}
                onClick={() => handleOtherStoryClick(index)}
              >
                <div className={styles.avatarWrapper}>
                  <div className={styles.gradientRing} style={{ background: ringBackground }}>
                    <div className={styles.avatarInner}>
                      {/* ✅ 4. ADIM: Arkadaşların resmi için de aynı ayar */}
                      <img
                        src={storyGroup.user.photoURL || DEFAULT_AVATAR}
                        alt={storyGroup.user.username}
                        className={styles.avatarImg}
                        onError={handleImageError}
                        referrerPolicy="no-referrer" // Pinterest vb. engellerini aşar
                        crossOrigin="anonymous"
                      />
                    </div>
                  </div>
                </div>
                <span className={styles.username} style={{ color: storyGroup.allSeen ? "#777" : "#fff" }}>
                  {storyGroup.user.displayName?.split(" ")[0]}
                </span>
              </div>
            );
          })}
        </div>

        {canScrollRight && (
          <button 
            className={`${styles.navButton} ${styles.navButtonRight}`} 
            onClick={() => scroll("right")}
          >
            <ChevronRight size={20} />
          </button>
        )}

      </div>

      {isViewerOpen && (
        <StoryViewer
          usersStories={getAllStories()}
          currentUser={currentUser}
          initialUserIndex={initialUserIndex}
          onClose={() => setIsViewerOpen(false)}
        />
      )}
    </>
  );
};

export default StoryBar;