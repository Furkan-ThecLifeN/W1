import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./StoryBar.module.css";
import StoryViewer from "../StoryViewer/StoryViewer";
import { useAuth } from "../../context/AuthProvider";
import { useUserData } from "../../hooks/useUserData";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useStoryStore } from "../../Store/useStoryStore";

const StoryBar = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // 🔥 Firestore kullanıcı verisi (Güncel fotoURL buradan geliyor!)
  const userData = useUserData(currentUser?.uid);

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

  // 🔥 feed + myStory yükleme
  useEffect(() => {
    if (currentUser) fetchStories(currentUser);
  }, [currentUser, fetchStories]);

  // Scroll kontrolü
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
    if (!scrollRef.current) return;

    const amount = scrollRef.current.clientWidth / 2;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });

    setTimeout(checkScroll, 300);
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
    return myStory ? [myStory, ...stories] : stories;
  };

  const getMyStoryRingColor = () => {
    if (!myStory) return "transparent";
    if (myStory.allSeen) return "#555";
    return "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)";
  };

  const showLoadingIndicator = loading && !isLoaded && stories.length === 0;

  return (
    <>
      <div className={styles.storyBarContainer}>
        {canScrollLeft && (
          <button className={`${styles.navButton} ${styles.navButtonLeft}`}
            onClick={() => scroll("left")}
          >
            <ChevronLeft size={20} />
          </button>
        )}

        <div className={styles.storiesScroller} ref={scrollRef} onScroll={checkScroll}>
          
          {/* 🔥 KENDİ HİKAYEM - Güncel fotoURL: userData.photoURL */}
          <div className={styles.storyItem} onClick={handleMyStoryClick}>
            <div className={styles.avatarWrapper}>
              <div
                className={myStory ? styles.gradientRing : styles.noStoryRing}
                style={myStory ? { background: getMyStoryRingColor() } : {}}
              >
                <div className={styles.avatarInnerFixed}>
                  <img
                    src={userData?.photoURL || null}
                    alt="avatar"
                    className={styles.avatarFixed}
                  />
                </div>
              </div>

              {!myStory && (
                <div className={styles.plusBadge}>
                  <Plus size={14} color="#fff" />
                </div>
              )}
            </div>

            <span
              className={styles.username}
              style={{ color: myStory?.allSeen ? "#777" : "#fff" }}
            >
              Your Story
            </span>
          </div>

          {/* LOADING */}
          {showLoadingIndicator && (
            <div className={styles.loadingItem}>
              <div className={styles.loadingSkeletonCircle}></div>
              <div className={styles.loadingSkeletonText}></div>
            </div>
          )}

          {/* 🔥 TAKİP ETTİĞİM KİŞİLERİN HİKAYELERİ */}
          {stories.map((storyGroup, index) => {
            let ringBg = storyGroup.allSeen
              ? "#555"
              : storyGroup.stories.some((s) => s.privacy === "close_friendships")
              ? "#4caf50"
              : "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)";

            return (
              <div
                key={storyGroup.user.uid}
                className={styles.storyItem}
                onClick={() => handleOtherStoryClick(index)}
              >
                <div className={styles.avatarWrapper}>
                  <div className={styles.gradientRing} style={{ background: ringBg }}>
                    <div className={styles.avatarInner}>
                      <img
                        src={storyGroup.user.photoURL}
                        alt={storyGroup.user.username}
                        className={styles.avatarImg}
                      />
                    </div>
                  </div>
                </div>

                <span
                  className={styles.username}
                  style={{ color: storyGroup.allSeen ? "#777" : "#fff" }}
                >
                  {storyGroup.user.displayName?.split(" ")[0]}
                </span>
              </div>
            );
          })}
        </div>

        {canScrollRight && (
          <button className={`${styles.navButton} ${styles.navButtonRight}`}
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
