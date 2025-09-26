import React, { useState } from "react";
import styles from "./TweetCard.module.css";
import { FiMoreHorizontal } from "react-icons/fi";
import ActionControls from "../actions/ActionControls";
import { defaultGetAuthToken } from "../actions/api";
import FollowButton from "../FollowButton/FollowButton";
import { useAuth } from "../../context/AuthProvider";
import DescriptionModal from "../DescriptionModal/DescriptionModal";

const TRUNCATE_LIMIT = 1000;

const getToken = async () => {
  try {
    return await defaultGetAuthToken();
  } catch (e) {
    console.error("TweetCard: Token alma hatası ->", e.message);
    return null;
  }
};

const TweetCard = ({ data }) => {
  const { currentUser } = useAuth();
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);

  if (!data || !data.id || !data.uid) {
    console.error("TweetCard: data veya data.id/uid eksik.");
    return null;
  }

  const isOwnFeeling = currentUser?.uid === data.uid;
  const description = data.text || "";
  const needsTruncation = description.length > TRUNCATE_LIMIT;
  const truncatedDescription = needsTruncation
    ? description.substring(0, TRUNCATE_LIMIT).trim() + "... Daha Fazla"
    : description;

  const renderActionControls = () => (
    <ActionControls
      targetType="feeling"
      targetId={data.id}
      getAuthToken={getToken}
      postOwnerUid={data.uid}
      commentsDisabled={data.commentsDisabled || false}
    />
  );

  return (
    <>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.user}>
            <div className={styles.avatar_widget}>
              <img src={data.photoURL} alt="avatar" className={styles.avatar} />
            </div>
            <span className={styles.username}>{data.displayName}</span>
          </div>
          <div className={styles.actions}>
            {!isOwnFeeling && (
              <FollowButton
                targetUid={data.uid}
                isTargetPrivate={data.isPrivate || false}
              />
            )}
            <FiMoreHorizontal className={styles.more} />
          </div>
        </div>

        <div
          className={`${styles.content} ${styles.feelings_text} ${
            needsTruncation ? styles.clickableDescription : ""
          }`}
          onClick={needsTruncation ? () => setIsDescriptionModalOpen(true) : undefined}
        >
          {truncatedDescription}
        </div>

        <div className={styles.footer}>{renderActionControls()}</div>
      </div>

      {isDescriptionModalOpen && (
        <DescriptionModal
          data={{ ...data, currentUser, caption: description }}
          onClose={() => setIsDescriptionModalOpen(false)}
          followStatus={data.followStatus || "none"}
        />
      )}
    </>
  );
};

export default TweetCard;
