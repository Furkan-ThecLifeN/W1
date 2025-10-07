import React, { useState, useEffect } from "react";
import { FaEllipsisV, FaHeart, FaCommentAlt, FaShare } from "react-icons/fa";
import { FiArrowDown, FiArrowUp } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./DiscoverUnifiedCard.module.css";

const DESCRIPTION_CHAR_LIMIT = 150;

// YouTube embed link oluşturucu (her iki kaynak için ortak)
const getYouTubeEmbedLink = (url) => {
  if (!url) return null;
  let videoId = null;
  const match = url.match(/(?:\/shorts\/|youtu\.be\/|v=|embed\/)([^&?/]+)/);
  if (match && match[1]) videoId = match[1];
  if (!videoId) return null;
  const params = new URLSearchParams({
    autoplay: 0,
    controls: 1,
    modestbranding: 1,
  });
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
};

export default function DiscoverUnifiedCard({
  data,
  onNext,
  onPrev,
  isNextDisabled,
  isPrevDisabled,
}) {
  const [doubleTapEffect, setDoubleTapEffect] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 1024);
  const [showMenu, setShowMenu] = useState(false);

  const isFirebaseData = data?.username || data?.displayName; // 🔹 Firebase mi?
  const embedLink = getYouTubeEmbedLink(data?.url || data?.mediaUrl);
  const profileUsername = data?.username || data?.displayName || "Anonim Kullanıcı";
  const userImageUrl =
    data?.userProfileImage ||
    data?.photoURL ||
    "https://i.pravatar.cc/150?img=1";
  const postDescription = data?.caption || data?.content || data?.text || "";
  const needsToTruncate = postDescription.length > DESCRIPTION_CHAR_LIMIT;
  const descriptionSnippet = needsToTruncate
    ? postDescription.substring(0, DESCRIPTION_CHAR_LIMIT).trim() + "..."
    : postDescription;

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth <= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMediaDoubleClick = () => {
    setDoubleTapEffect(true);
    setTimeout(() => setDoubleTapEffect(false), 1000);
  };

  const renderVideoActionControls = (isDesktopLayout) => {
    const buttonSize = isDesktopLayout ? "55px" : "40px";
    const iconSize = isDesktopLayout ? 24 : 18;
    const fontSize = isDesktopLayout ? "12px" : "10px";

    return (
      <>
        <div style={{ textAlign: "center" }}>
          <button
            className={styles.arrowButton}
            style={{ width: buttonSize, height: buttonSize, backgroundColor: "#FF5733" }}
            onClick={() => alert("Beğenme aksiyonu çalışacak.")}
          >
            <FaHeart size={iconSize} />
          </button>
          <div style={{ fontSize, marginTop: "5px", color: "#fff" }}>
            {data?.stats?.likes || 0}
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <button
            className={styles.arrowButton}
            style={{ width: buttonSize, height: buttonSize, backgroundColor: "#337AFF" }}
            onClick={() => alert("Yorum aksiyonu çalışacak.")}
          >
            <FaCommentAlt size={iconSize} />
          </button>
          <div style={{ fontSize, marginTop: "5px", color: "#fff" }}>
            {data?.stats?.comments || 0}
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <button
            className={styles.arrowButton}
            style={{ width: buttonSize, height: buttonSize, backgroundColor: "#17A2B8" }}
            onClick={() => alert("Paylaşma aksiyonu çalışacak.")}
          >
            <FaShare size={iconSize} />
          </button>
          <div style={{ fontSize, marginTop: "5px", color: "#fff" }}>
            {data?.stats?.shares || 0}
          </div>
        </div>
      </>
    );
  };

  if (!embedLink) {
    return (
      <div className={styles.mainWrapper}>
        <div className={styles.errorText}>Video linki geçersiz veya bulunamadı.</div>
      </div>
    );
  }

  /* ==========================================================
     DESKTOP GÖRÜNÜM
     ========================================================== */
  if (!isMobileView) {
    return (
      <div className={styles.mainWrapper}>
        <div className={styles.contentLayout}>
          {/* SOL KISIM */}
          <div className={styles.videoAndInfoBox}>
            <div className={styles.videoPlayerOnly} onDoubleClick={handleMediaDoubleClick}>
              <iframe
                className={styles.mediaFrame}
                src={embedLink}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>

              <AnimatePresence>
                {doubleTapEffect && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className={styles.likePulse}
                  >
                    <FaHeart />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 🔹 SADECE FIREBASE VERİLERİNDE PROFİL GÖRÜNECEK */}
            {isFirebaseData && (
              <div className={styles.detailsCard}>
                <div className={styles.userDetailsDesktop}>
                  <img src={userImageUrl} alt={profileUsername} className={styles.userPicDesktop} />
                  <div className={styles.userTextContent}>
                    <span className={styles.displayName}>{profileUsername}</span>
                    <div
                      className={`${styles.postDesc} ${
                        needsToTruncate ? styles.clickableDesc : ""
                      }`}
                      onClick={() => alert("Daha Fazla Açıklama Modalı açılacak")}
                    >
                      {descriptionSnippet}
                      {needsToTruncate && (
                        <span className={styles.readMoreText}>Daha Fazla</span>
                      )}
                    </div>
                  </div>
                  <button
                    className={styles.followUserButtonDesktop}
                    onClick={() => alert(`@${profileUsername} takip ediliyor...`)}
                  >
                    Takip Et
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SAĞ KISIM */}
          <div className={styles.controlsBox}>
            <div className={styles.appLogoText}>W1</div>

            <div className={styles.actionZone}>
              {renderVideoActionControls(true)}
              <div className={styles.optionsWrapper}>
                <FaEllipsisV
                  className={styles.optionsIcon}
                  onClick={() => setShowMenu(!showMenu)}
                />
              </div>
            </div>

            <div className={styles.scrollControls}>
              <button
                className={styles.arrowButton}
                onClick={onPrev}
                disabled={isPrevDisabled}
              >
                <FiArrowUp size={24} />
              </button>
              <button
                className={styles.arrowButton}
                onClick={onNext}
                disabled={isNextDisabled}
              >
                <FiArrowDown size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================
     MOBİL GÖRÜNÜM
     ========================================================== */
  return (
    <div className={styles.mainWrapper} style={{ maxWidth: "450px" }}>
      <div className={styles.videoUnit}>
        <div className={styles.playerArea} onDoubleClick={handleMediaDoubleClick}>
          <iframe
            className={styles.mediaFrame}
            src={embedLink}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>

          <AnimatePresence>
            {doubleTapEffect && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className={styles.likePulse}
              >
                <FaHeart />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 🔹 FIREBASE VERİSİNDE GÖRÜNÜR */}
        {isFirebaseData && (
          <div className={styles.bottomInfoBar}>
            <div className={styles.userDetails}>
              <img src={userImageUrl} alt={profileUsername} className={styles.userPic} />
              <div className={styles.userTextContent}>
                <span className={styles.displayName}>{profileUsername}</span>
                <div
                  className={`${styles.postDesc} ${
                    needsToTruncate ? styles.clickableDesc : ""
                  }`}
                  onClick={() => alert("Daha Fazla Açıklama Modalı açılacak")}
                >
                  {descriptionSnippet}
                  {needsToTruncate && (
                    <span className={styles.readMoreText}>Daha Fazla</span>
                  )}
                </div>
              </div>
              <button
                className={styles.followUserButton}
                onClick={() => alert(`@${profileUsername} takip ediliyor...`)}
              >
                Takip Et
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={styles.sideControls}>
        {renderVideoActionControls(false)}
        <div className={styles.extraOptionsContainer}>
          <FaEllipsisV
            className={styles.optionsIcon}
            onClick={() => setShowMenu(!showMenu)}
            style={{ marginTop: 0, color: "#fff" }}
          />
        </div>
      </div>
    </div>
  );
}
