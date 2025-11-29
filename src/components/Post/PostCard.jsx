import React, { useState, useEffect } from "react";
import styles from "./PostCard.module.css";
import { MdMore } from "react-icons/md";
import ActionControls from "../actions/ActionControls";
import { defaultGetAuthToken } from "../actions/api";
import FollowButton from "../FollowButton/FollowButton";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import PostOptionsCard from "../PostOptionsCard/PostOptionsCard";
import DescriptionModal from "../DescriptionModal/DescriptionModal";
import PrivacyIndicator from "../../utils/PrivacyIndicator";

const TRUNCATE_LIMIT = 100;
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

const PostCard = ({ data, followStatus = "none", onFollowStatusChange }) => {
  const [tokenError, setTokenError] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [commentsDisabled, setCommentsDisabled] = useState(
    data?.commentsDisabled || false
  );

  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const description = data?.caption || "";
  const needsTruncation = description.length > TRUNCATE_LIMIT;
  const truncatedDescription = needsTruncation
    ? description.substring(0, TRUNCATE_LIMIT).trim() + "..."
    : description;

  // Medya URL'sini ve tipini belirle
  // Backend güncellendiği için mediaUrls öncelikli, yoksa imageUrls (geriye dönük uyumluluk)
  const mediaUrl = data?.mediaUrls?.[0] || data?.imageUrls?.[0];
  
  // Eğer veritabanında mediaType varsa onu kullan, yoksa ve URL mp4 ise video kabul et
  const isVideo = 
    data?.mediaType === "video" || 
    (typeof mediaUrl === "string" && /\.(mp4|webm|ogg|mov)$/i.test(mediaUrl));

  const getToken = async () => {
    try {
      return await defaultGetAuthToken();
    } catch (e) {
      console.error("PostCard: Token alma hatası ->", e.message);
      setTokenError(true);
      return null;
    }
  };

  const isOwnPost = currentUser?.uid === data?.uid;

  const renderActionControls = () => {
    if (!data?.id) return null;
    return (
      <ActionControls
        targetType="post"
        targetId={data.id}
        getAuthToken={getToken}
        commentsDisabled={commentsDisabled}
      />
    );
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Bu gönderiyi silmek istediğinize emin misiniz?"))
      return;
    try {
      const token = await getToken();
      const res = await fetch(`${BASE_URL}/api/posts/${data.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Silme işlemi başarısız");
      window.location.reload();
    } catch (e) {
      console.error("Gönderi silme hatası:", e);
      alert("Gönderi silinemedi.");
    }
  };

  const handleDisableComments = async () => {
    try {
      const token = await getToken();
      const res = await fetch(
        `${BASE_URL}/api/posts/${data.id}/disable-comments`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Yorumlar kapatılamadı");

      setCommentsDisabled(true);
      setShowOptions(false);
    } catch (e) {
      console.error("Yorumları kapatma hatası:", e);
      alert("Yorumlar kapatılamadı.");
    }
  };

  const handleEnableComments = async () => {
    try {
      const token = await getToken();
      const res = await fetch(
        `${BASE_URL}/api/posts/${data.id}/enable-comments`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Yorumlar açılamadı");

      setCommentsDisabled(false);
      setShowOptions(false);
    } catch (e) {
      console.error("Yorumları açma hatası:", e);
      alert("Yorumlar açılamadı.");
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
      alert("Rapor başarıyla iletildi.");
    } catch (e) {
      console.error("Raporlama hatası:", e);
      alert("Rapor gönderilemedi.");
    }
  };

  useEffect(() => {
    if (!data) return console.warn("PostCard: data yok!");
    if (!data.id) console.warn("PostCard: post id eksik!");
    // mediaUrl kontrolü (video veya resim)
    if (!mediaUrl && !data.caption) console.warn("PostCard: içerik yok (medya veya metin)!");
  }, [data, mediaUrl]);

  if (!data) return null;

  // Medya İçeriği Render Fonksiyonu (Kod tekrarını önlemek için)
  const renderMedia = (isMobile = false) => {
    if (!mediaUrl) return null;
    
    const className = isMobile ? styles.post_image_mobile : styles.post_image;

    if (isVideo) {
      return (
        <video
          src={mediaUrl}
          className={className}
          controls
          controlsList="nodownload" // İsteğe bağlı: indirmeyi zorlaştırmak için
          playsInline
          loop
          // Eğer videonun otomatik sessiz başlamasını istersen aşağıdakileri açabilirsin:
          // muted 
          // autoPlay
        />
      );
    }

    return (
      <img
        src={mediaUrl}
        alt="Post"
        className={className}
      />
    );
  };

  return (
    <>
      {/* --- DESKTOP VIEW --- */}
      <div className={`${styles.post_card} ${styles.desktop}`}>
        {/* Medya Gösterimi (Resim veya Video) */}
        {renderMedia(false)}
        
        <div className={styles.post_overlay}>
          <div className={styles.post_header}>
            <div className={styles.user_info}>
              <div className={styles.avatar_widget}>
                <img
                  src={data.photoURL || ""}
                  alt="avatar"
                  className={styles.avatar}
                  onClick={() => navigate(`/profile/${data.username}`)}
                />
              </div>
              <span className={styles.username}>
                {data.displayName || "Bilinmeyen Kullanıcı"}
              </span>
              <PrivacyIndicator privacy={data.privacy} />
            </div>
            <div className={styles.actions}>
              {!isOwnPost && (
                <FollowButton
                  targetUid={data.uid}
                  isTargetPrivate={data.isPrivate}
                  initialFollowStatus={followStatus}
                  onFollowStatusChange={(newStatus) =>
                    onFollowStatusChange?.(newStatus, data.uid)
                  }
                />
              )}
              <div className={styles.optionsContainer}>
                <MdMore
                  className={styles.more_icon}
                  onClick={() => setShowOptions(!showOptions)}
                />
                {showOptions && (
                  <PostOptionsCard
                    isOwner={isOwnPost}
                    postId={data.id}
                    postOwnerId={data.uid}
                    commentsDisabled={commentsDisabled}
                    onDelete={handleDeletePost}
                    onDisableComments={handleDisableComments}
                    onEnableComments={handleEnableComments}
                    onReport={handleReportPost}
                  />
                )}
              </div>
            </div>
          </div>
          <div className={styles.post_footer}>
            <p
              className={`${styles.post_text} ${
                needsTruncation ? styles.clickableDescription : ""
              }`}
              onClick={
                needsTruncation
                  ? () => setIsDescriptionModalOpen(true)
                  : undefined
              }
            >
              {truncatedDescription}
              {needsTruncation && (
                <span className={styles.readMore}>Daha Fazla</span>
              )}
            </p>
            {renderActionControls()}
            {tokenError && (
              <div style={{ color: "red", fontSize: "12px" }}>
                Token alınamadı, ActionControls çalışmayabilir!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- MOBILE VIEW --- */}
      <div className={`${styles.post_card_mobile} ${styles.mobile}`}>
        <div className={styles.post_header_mobile}>
          <div className={styles.user_info}>
            <div className={styles.avatar_widget}>
              <img
                src={data.photoURL || ""}
                alt="avatar"
                className={styles.avatar}
                onClick={() => navigate(`/profile/${data.username}`)}
              />
            </div>
            <span className={styles.username}>
              {data.displayName || "Bilinmeyen Kullanıcı"}
            </span>
            <PrivacyIndicator privacy={data.privacy} />
          </div>
          <div className={styles.actions}>
            {!isOwnPost && (
              <FollowButton
                targetUid={data.uid}
                isTargetPrivate={data.isPrivate}
                initialFollowStatus={followStatus}
                onFollowStatusChange={(newStatus) =>
                  onFollowStatusChange?.(newStatus, data.uid)
                }
              />
            )}
            <div className={styles.optionsContainer}>
              <MdMore
                className={styles.more_icon}
                onClick={() => setShowOptions(!showOptions)}
              />
              {showOptions && (
                <PostOptionsCard
                  isOwner={isOwnPost}
                  postId={data.id}
                  postOwnerId={data.uid}
                  commentsDisabled={commentsDisabled}
                  onDelete={handleDeletePost}
                  onDisableComments={handleDisableComments}
                  onEnableComments={handleEnableComments}
                  onReport={handleReportPost}
                />
              )}
            </div>
          </div>
        </div>
        
        {/* Mobil Medya Gösterimi (Resim veya Video) */}
        {renderMedia(true)}
        
        <div className={styles.post_footer_mobile}>
          <p
            className={`${styles.post_text} ${
              needsTruncation ? styles.clickableDescription : ""
            }`}
            onClick={
              needsTruncation
                ? () => setIsDescriptionModalOpen(true)
                : undefined
            }
          >
            {truncatedDescription}
            {needsTruncation && (
              <span className={styles.readMore}>Daha Fazla</span>
            )}
          </p>
          {renderActionControls()}
        </div>
      </div>

      {isDescriptionModalOpen && (
        <DescriptionModal
          data={{ ...data, currentUser, caption: description }}
          onClose={() => setIsDescriptionModalOpen(false)}
          followStatus={followStatus}
          onFollowStatusChange={onFollowStatusChange}
        />
      )}
    </>
  );
};

export default PostCard;