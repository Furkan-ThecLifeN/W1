import React, { useState, useEffect, useRef } from "react";
import styles from "./PublicStoryBar.module.css";
import StoryViewer from "../StoryViewer/StoryViewer";
import { useAuth } from "../../context/AuthProvider";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useStoryStore } from "../../Store/useStoryStore";

const PublicStoryBar = () => {
  const { currentUser } = useAuth();
  const scrollRef = useRef(null);

  // Store'dan public feed'i çekiyoruz
  const { publicFeed, fetchPublicStories, markPublicAsSeen } = useStoryStore();

  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [initialUserIndex, setInitialUserIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Veriyi Çek
  useEffect(() => {
    if (currentUser) {
      fetchPublicStories(currentUser);
    }
  }, [currentUser, fetchPublicStories]);

  // Scroll Butonlarını Kontrol Et
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      // 1px tolerans
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [publicFeed]);

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

  const handleStoryClick = (index) => {
    setInitialUserIndex(index);
    setIsViewerOpen(true);
  };

  // Eğer feed boşsa veya undefined ise hiçbir şey gösterme
  if (!publicFeed || !Array.isArray(publicFeed) || publicFeed.length === 0) {
    return null;
  }

  return (
    <>
      <div className={styles.storyBarContainer}>
        {/* Sol Ok */}
        {canScrollLeft && (
          <button
            className={`${styles.navButton} ${styles.navButtonLeft}`}
            onClick={() => scroll("left")}
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {/* Scroll Alanı */}
        <div
          className={styles.storiesScroller}
          ref={scrollRef}
          onScroll={checkScroll}
        >
          {publicFeed.map((storyGroup, index) => {
            // Public Hikaye Rengi: Görüldü ise Gri, Değilse Mavi Gradient
            const ringColor = storyGroup.allSeen
              ? "#555555"
              : "linear-gradient(45deg, #00c6ff, #0072ff)";

            return (
              <div
                key={storyGroup.user.uid}
                className={styles.storyItem}
                onClick={() => handleStoryClick(index)}
              >
                <div className={styles.avatarWrapper}>
                  <div
                    className={styles.gradientRing}
                    style={{ background: ringColor }}
                  >
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
                  className={`${styles.username} ${
                    storyGroup.allSeen ? styles.seen : ""
                  }`}
                >
                  {storyGroup.user.displayName?.split(" ")[0]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Sağ Ok */}
        {canScrollRight && (
          <button
            className={`${styles.navButton} ${styles.navButtonRight}`}
            onClick={() => scroll("right")}
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      {/* Viewer */}
      {isViewerOpen && (
        <StoryViewer
          usersStories={publicFeed}
          currentUser={currentUser}
          initialUserIndex={initialUserIndex}
          onClose={() => setIsViewerOpen(false)}
          // ÖZEL PROP: Bu viewer public story gösteriyor, dolayısıyla public update fonksiyonunu kullanmalı
          customMarkAsSeen={markPublicAsSeen}
        />
      )}
    </>
  );
};

export default PublicStoryBar;
