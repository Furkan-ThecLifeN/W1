import React, { useState, useEffect } from "react";
import { MdMore } from "react-icons/md";
import { FaHeart, FaEllipsisV } from "react-icons/fa";
import ActionControls from "../../actions/ActionControls";
import { defaultGetAuthToken } from "../../actions/api";
import FollowButton from "../../FollowButton/FollowButton";
import { useAuth } from "../../../context/AuthProvider";
import styles from "./DiscoverVideoCard.module.css";
import { motion, AnimatePresence } from "framer-motion";
import DescriptionModal from "../../DescriptionModal/DescriptionModal";
import PostOptionsCard from "../../PostOptionsCard/PostOptionsCard";
// ✅ 1. ADIM: PrivacyIndicator bileşenini import et
// (Dosya yolunu kendi projenize göre düzenlemeniz gerekebilir)
import PrivacyIndicator from "../../../utils/PrivacyIndicator";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

const getYouTubeEmbedLink = (url) => {
  let videoId = null;
  if (url.includes("youtube.com/embed/")) {
    const embedMatch = url.match(/embed\/([^?]+)/);
    if (embedMatch && embedMatch[1]) videoId = embedMatch[1].split("?")[0];
  } else {
    const videoIdMatch = url.match(/(?:\/shorts\/|youtu\.be\/|v=)([^&?/]+)/);
    if (videoIdMatch && videoIdMatch[1]) videoId = videoIdMatch[1];
  }
  if (!videoId) return null;
  const params = new URLSearchParams({
    autoplay: 1,
    muted: 0,
    loop: 1,
    controls: 1,
    playlist: videoId,
    modestbranding: 1,
  });
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
};

const DESCRIPTION_CHAR_LIMIT = 150;

export default function DiscoverVideoCard({
  data,
  followStatus = "none",
  onFollowStatusChange,
  onNextPost,
  onPrevPost,
  isFirstItem,
  isLastItem,
}) {
  const [doubleTapEffect, setDoubleTapEffect] = useState(false);
  const { currentUser } = useAuth();
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 1024);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const mediaSourceUrl = data?.mediaUrl;
  const postDescription = data?.caption || data?.content || "Açıklama yok.";
  const profileUsername =
    data?.username || data?.displayName || "Anonim Kullanıcı";
  const userImageUrl =
    data?.userProfileImage ||
    data?.photoURL ||
    "https://i.pravatar.cc/150?img=1";
  const isOwnerPost = currentUser?.uid === data?.uid;

  const needsToTruncate = postDescription.length > DESCRIPTION_CHAR_LIMIT;
  const descriptionSnippet = needsToTruncate
    ? postDescription.substring(0, DESCRIPTION_CHAR_LIMIT).trim() + "..."
    : postDescription;

  useEffect(() => {
    const checkViewportSize = () => setIsMobileView(window.innerWidth <= 1024);
    window.addEventListener("resize", checkViewportSize);
    checkViewportSize();
    return () => window.removeEventListener("resize", checkViewportSize);
  }, []);

  const handleMediaDoubleClick = () => {
    setDoubleTapEffect(true);
    setTimeout(() => setDoubleTapEffect(false), 1000);
  };

  const getToken = async () => {
    try {
      return await defaultGetAuthToken();
    } catch (e) {
      console.error("Token alma hatası ->", e);
      return null;
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Bu gönderiyi silmek istediğinize emin misiniz?"))
      return;
    try {
      const token = await getToken();
      const res = await fetch(`${BASE_URL}/api/feeds/${data.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Silme işlemi başarısız");
      alert("Gönderi silindi.");
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Silme işlemi başarısız");
    }
  };

  const handleDisableComments = async () => {
    try {
      const token = await getToken();
      const res = await fetch(
        `${BASE_URL}/api/feeds/${data.id}/disable-comments`,
        { method: "PATCH", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Yorumlar kapatılamadı");
      alert("Yorumlar kapatıldı");
      setShowMenu(false);
    } catch (e) {
      console.error(e);
      alert("Yorumlar kapatılamadı");
    }
  };

  const handleEnableComments = async () => {
    try {
      const token = await getToken();
      const res = await fetch(
        `${BASE_URL}/api/feeds/${data.id}/enable-comments`,
        { method: "PATCH", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Yorumlar açılamadı");
      alert("Yorumlar açıldı");
      setShowMenu(false);
    } catch (e) {
      console.error(e);
      alert("Yorumlar açılamadı");
    }
  };

  const handleReportPost = async (reason = "Uygunsuz içerik") => {
    try {
      const token = await getToken();
      const res = await fetch(`${BASE_URL}/api/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          postId: data.id,
          reportedUserId: data.uid,
          reason,
        }),
      });
      if (!res.ok) throw new Error("Rapor gönderilemedi");
      alert("Rapor gönderildi");
      setShowMenu(false);
    } catch (e) {
      console.error(e);
      alert("Rapor gönderilemedi");
    }
  };

  const renderVideoActionControls = (isDesktopLayout) => {
    if (!data?.id || !data?.uid) return null;
    const backendType = "feed";

    return (
      <ActionControls
        targetType={backendType}
        targetId={data.id}
        postOwnerUid={data.uid}
        commentsDisabled={data.commentsDisabled || false}
        getAuthToken={defaultGetAuthToken}
        forceLayout={isDesktopLayout ? "vertical" : "horizontal"}
      />
    );
  };

  const embedLink = mediaSourceUrl ? getYouTubeEmbedLink(mediaSourceUrl) : null;

  if (!data || !embedLink)
    return (
      <div className={styles.mainWrapper}>
        <div
          className={styles.contentLayout}
          style={{ justifyContent: "center", alignItems: "center" }}
        >
          <div className={styles.errorText}>
            Video linki geçersiz veya veri bulunamadı.
          </div>
        </div>
      </div>
    );

  if (!isMobileView) {
    return (
      <div className={styles.mainWrapper}>
        <div className={styles.contentLayout}>
          <div className={styles.videoAndInfoBox}>
            <div
              className={styles.videoPlayerOnly}
              onDoubleClick={handleMediaDoubleClick}
            >
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
            <div className={styles.detailsCard}>
              <div className={styles.userDetailsDesktop}>
                <img
                  src={userImageUrl}
                  alt={profileUsername}
                  className={styles.userPicDesktop}
                />
                <div className={styles.userTextContent}>
                  <div className={styles.userDisplayLine}>
                    <span className={styles.displayName}>
                      {profileUsername}
                    </span>
                    {/* ✅ 2. ADIM (MASAÜSTÜ): Belirteci buraya ekle */}
                    <PrivacyIndicator privacy={data.privacy} />
                  </div>
                  <div
                    className={`${styles.postDesc} ${
                      needsToTruncate ? styles.clickableDesc : ""
                    }`}
                    onClick={
                      needsToTruncate
                        ? () => setIsModalVisible(true)
                        : undefined
                    }
                  >
                    {descriptionSnippet}
                    {needsToTruncate && (
                      <span className={styles.readMoreText}>Daha Fazla</span>
                    )}
                  </div>
                </div>
                {!isOwnerPost && (
                  <FollowButton
                    targetUid={data.uid}
                    isTargetPrivate={data.isPrivate || false}
                    initialFollowStatus={followStatus}
                    onFollowStatusChange={(newStatus) =>
                      onFollowStatusChange?.(newStatus, data.uid)
                    }
                    className={styles.followUserButtonDesktop}
                  />
                )}
              </div>
            </div>
          </div>
          <div className={styles.controlsBox}>
            <div className={styles.appLogoText}>W1</div>
            <div className={styles.actionZone}>
              {renderVideoActionControls(true)}
              <div className={styles.optionsWrapper}>
                <FaEllipsisV
                  className={styles.optionsIcon}
                  onClick={() => setShowMenu(!showMenu)}
                />
                {showMenu && (
                  <PostOptionsCard
                    isOwner={isOwnerPost}
                    postId={data.id}
                    postOwnerId={data.uid}
                    commentsDisabled={data.commentsDisabled || false}
                    onDelete={handleDeletePost}
                    onDisableComments={handleDisableComments}
                    onEnableComments={handleEnableComments}
                    onReport={handleReportPost}
                    position="right"
                  />
                )}
              </div>
            </div>
            <div className={styles.scrollControls}>
              <button
                className={styles.arrowButton}
                aria-label="Önceki İçerik"
                onClick={onPrevPost}
                disabled={isFirstItem}
              >
                <span className={styles.controlArrow}>&#9650;</span>
              </button>
              <button
                className={styles.arrowButton}
                aria-label="Sonraki İçerik"
                onClick={onNextPost}
                disabled={isLastItem}
              >
                <span className={styles.controlArrow}>&#9660;</span>
              </button>
            </div>
          </div>
        </div>
        {isModalVisible && (
          <DescriptionModal
            data={{ ...data, currentUser }}
            onClose={() => setIsModalVisible(false)}
            followStatus={followStatus}
            onFollowStatusChange={onFollowStatusChange}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={styles.mainWrapper}
      style={{ maxWidth: "450px", padding: 0 }}
    >
      <div className={styles.videoUnit}>
        <div
          className={styles.playerArea}
          onDoubleClick={handleMediaDoubleClick}
        >
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
        <div className={styles.bottomInfoBar}>
          <div className={styles.userDetails}>
            <img
              src={userImageUrl}
              alt={profileUsername}
              className={styles.userPic}
            />
            <div className={styles.userTextContent}>
              <div className={styles.userDisplayLine}>
                <span className={styles.displayName}>{profileUsername}</span>
                {/* ✅ 3. ADIM (MOBİL): Belirteci buraya ekle */}
                <PrivacyIndicator privacy={data.privacy} />
              </div>
              <div
                className={`${styles.postDesc} ${
                  needsToTruncate ? styles.clickableDesc : ""
                }`}
                onClick={
                  needsToTruncate ? () => setIsModalVisible(true) : undefined
                }
              >
                {descriptionSnippet}
                {needsToTruncate && (
                  <span className={styles.readMoreText}>Daha Fazla</span>
                )}
              </div>
            </div>
            {!isOwnerPost && (
              <FollowButton
                targetUid={data.uid}
                isTargetPrivate={data.isPrivate || false}
                initialFollowStatus={followStatus}
                onFollowStatusChange={(newStatus) =>
                  onFollowStatusChange?.(newStatus, data.uid)
                }
                className={styles.followUserButton}
              />
            )}
          </div>
        </div>
      </div>
      <div className={styles.sideControls}>
        {renderVideoActionControls(false)}
        <div className={styles.extraOptionsContainer}>
          <MdMore
            className={styles.optionsIcon}
            onClick={() => setShowMenu(!showMenu)}
            style={{ marginTop: 0, color: "#fff" }}
          />
          {showMenu && (
            <PostOptionsCard
              isOwner={isOwnerPost}
              postId={data.id}
              postOwnerId={data.uid}
              commentsDisabled={data.commentsDisabled || false}
              onDelete={handleDeletePost}
              onDisableComments={handleDisableComments}
              onEnableComments={handleEnableComments}
              onReport={handleReportPost}
              position="left"
            />
          )}
        </div>
      </div>
      {isModalVisible && (
        <DescriptionModal
          data={{ ...data, currentUser }}
          onClose={() => setIsModalVisible(false)}
          followStatus={followStatus}
          onFollowStatusChange={onFollowStatusChange}
        />
      )}
    </div>
  );
}
