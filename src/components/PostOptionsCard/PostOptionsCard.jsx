// components/PostOptionsCard/PostOptionsCard.jsx
import React, { useState } from "react";
import styles from "./PostOptionsCard.module.css";
import ReportModal from "../ReportModal/ReportModal";

// React-icons'dan modern simgeler kullanmak için
// Öncelikle projenize react-icons'u kurmanız gerekebilir:
// npm install react-icons
import { FiTrash2, FiMessageCircle, FiFlag } from "react-icons/fi";

const PostOptionsCard = ({
  isOwner,
  postId,
  postOwnerId,
  commentsDisabled,
  onDelete,
  onDisableComments,
  onEnableComments,
}) => {
  const [showReportModal, setShowReportModal] = useState(false);

  return (
    <div className={styles.card}>
      {isOwner && (
        <>
          <button className={styles.deleteButton} onClick={onDelete}>
            <FiTrash2 className={styles.icon} />
            <span>Sil</span>
          </button>

          {commentsDisabled ? (
            <button
              className={styles.enableCommentsButton}
              onClick={onEnableComments}
            >
              <FiMessageCircle className={styles.icon} />
              <span>Yorumları Aç</span>
            </button>
          ) : (
            <button
              className={styles.disableCommentsButton}
              onClick={onDisableComments}
            >
              <FiMessageCircle className={styles.icon} />
              <span>Yorumları Kapat</span>
            </button>
          )}
        </>
      )}

      <button
        className={styles.reportButton}
        onClick={() => setShowReportModal(true)}
      >
        <FiFlag className={styles.icon} />
        <span>Şikayet Et</span>
      </button>

      {showReportModal && (
        <ReportModal
          postId={postId}
          reportedUserId={postOwnerId}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
};

export default PostOptionsCard;
