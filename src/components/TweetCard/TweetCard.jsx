import React, { useState } from "react";
import styles from "./TweetCard.module.css";
import { MdMore } from "react-icons/md";
import ActionControls from "../actions/ActionControls";
import { defaultGetAuthToken } from "../actions/api";
import FollowButton from "../FollowButton/FollowButton";
import { useAuth } from "../../context/AuthProvider";
import DescriptionModal from "../DescriptionModal/DescriptionModal";
import PostOptionsCard from "../PostOptionsCard/PostOptionsCard";
import { useNavigate } from "react-router-dom";

const TRUNCATE_LIMIT = 1000;
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

const TweetCard = ({ data, followStatus = "none", onFollowStatusChange }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [commentsDisabled, setCommentsDisabled] = useState(data?.commentsDisabled || false);
  const [tokenError, setTokenError] = useState(false);

  if (!data || !data.id || !data.uid) return null;

  const isOwnFeeling = currentUser?.uid === data.uid;
  const description = data.text || "";
  const needsTruncation = description.length > TRUNCATE_LIMIT;
  const truncatedDescription = needsTruncation
    ? description.substring(0, TRUNCATE_LIMIT).trim() + "... Daha Fazla"
    : description;

  const getToken = async () => {
    try {
      return await defaultGetAuthToken();
    } catch (e) {
      console.error("TweetCard: Token alma hatası ->", e.message);
      setTokenError(true);
      return null;
    }
  };

  const handleDeleteFeeling = async () => {
    if (!window.confirm("Bu gönderiyi silmek istediğinize emin misiniz?")) return;
    try {
      const token = await getToken();
      const res = await fetch(`${BASE_URL}/api/feelings/${data.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Silme işlemi başarısız");
      alert("Gönderi başarıyla silindi.");
      window.location.reload();
    } catch (e) {
      console.error("TweetCard: Silme hatası ->", e);
      alert("Gönderi silinemedi.");
    }
  };

  const handleDisableComments = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${BASE_URL}/api/feelings/${data.id}/disable-comments`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Yorumlar kapatılamadı");
      setCommentsDisabled(true);
      setShowOptions(false);
      alert("Yorumlar kapatıldı.");
    } catch (e) {
      console.error("TweetCard: Yorum kapatma hatası ->", e);
      alert("Yorumlar kapatılamadı.");
    }
  };

  const handleEnableComments = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${BASE_URL}/api/feelings/${data.id}/enable-comments`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Yorumlar açılamadı");
      setCommentsDisabled(false);
      setShowOptions(false);
      alert("Yorumlar açıldı.");
    } catch (e) {
      console.error("TweetCard: Yorum açma hatası ->", e);
      alert("Yorumlar açılamadı.");
    }
  };

  const handleReportFeeling = async (reason = "Uygunsuz içerik") => {
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
      console.error("TweetCard: Raporlama hatası ->", e);
      alert("Rapor gönderilemedi.");
    }
  };

  const renderActionControls = () => (
    <ActionControls
      targetType="feeling"
      targetId={data.id}
      getAuthToken={getToken}
      commentsDisabled={commentsDisabled}
    />
  );

  return (
    <>
      <div className={styles.card}>
        {data.images?.[0] && (
          <img
            src={data.images[0]}
            alt="Feeling"
            className={styles.post_image}
          />
        )}

        <div className={styles.header}>
          <div className={styles.user}>
            <div className={styles.avatar_widget}>
              <img
                src={data.photoURL}
                alt="avatar"
                className={styles.avatar}
                onClick={() => navigate(`/profile/${data.username}`)}
              />
            </div>
            <span className={styles.username}>{data.displayName}</span>
          </div>

          <div className={styles.actions}>
            {!isOwnFeeling && (
              <FollowButton
                targetUid={data.uid}
                isTargetPrivate={data.isPrivate || false}
                initialFollowStatus={followStatus}
                onFollowStatusChange={(newStatus) => onFollowStatusChange?.(newStatus, data.uid)}
              />
            )}
            <div className={styles.optionsContainer}>
              <MdMore
                className={styles.more_icon}
                onClick={() => setShowOptions(!showOptions)}
              />
              {showOptions && (
                <PostOptionsCard
                  isOwner={isOwnFeeling}
                  postId={data.id}
                  postOwnerId={data.uid}
                  commentsDisabled={commentsDisabled}
                  onDelete={handleDeleteFeeling}
                  onDisableComments={handleDisableComments}
                  onEnableComments={handleEnableComments}
                  onReport={handleReportFeeling}
                />
              )}
            </div>
          </div>
        </div>

        <div
          className={`${styles.content} ${needsTruncation ? styles.clickableDescription : ""}`}
          onClick={needsTruncation ? () => setIsDescriptionModalOpen(true) : undefined}
        >
          {truncatedDescription}
        </div>

        <div className={styles.footer}>{renderActionControls()}</div>
        {tokenError && (
          <div style={{ color: "red", fontSize: "12px" }}>
            Token alınamadı, ActionControls çalışmayabilir!
          </div>
        )}
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

export default TweetCard;
