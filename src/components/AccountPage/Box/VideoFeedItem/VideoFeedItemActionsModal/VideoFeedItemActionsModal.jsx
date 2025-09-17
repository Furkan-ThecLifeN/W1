import React, { useEffect, useRef, useState } from "react";
import styles from "./VideoFeedItemActionsModal.module.css";
import { FiX, FiSend, FiTrash2, FiLink } from "react-icons/fi";
import { useAuth } from "../../../../../context/AuthProvider";
import { useUser } from "../../../../../context/UserContext";
import { auth } from "../../../../../config/firebase-client";

const tsToMillis = (ts) => {
  if (!ts) return 0;
  if (ts.toDate instanceof Function) {
    try {
      return ts.toDate().getTime();
    } catch {
      return 0;
    }
  }
  if (typeof ts === "object" && ts.seconds !== undefined) {
    return ts.seconds * 1000 + Math.floor((ts.nanoseconds || 0) / 1e6);
  }
  if (typeof ts === "string" || ts instanceof String) {
    const n = Date.parse(ts);
    return Number.isNaN(n) ? 0 : n;
  }
  if (ts instanceof Date) return ts.getTime();
  if (typeof ts === "number") return ts;
  return 0;
};

const DEFAULT_AVATAR =
  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";

const DeleteConfirmationModal = ({ show, onConfirm, onCancel }) => {
  if (!show) return null;
  return (
    <div className={styles.postsConfirmationModalOverlay} onClick={onCancel}>
      <div
        className={styles.postsConfirmationModalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.postsConfirmationHeader}>
          <h4>Yorumu Sil</h4>
          <button
            onClick={onCancel}
            className={styles.postsConfirmationCloseButton}
          >
            <FiX />
          </button>
        </div>
        <p>Bu yorumu silmek istediğinize emin misiniz?</p>
        <div className={styles.postsConfirmationActions}>
          <button onClick={onCancel} className={styles.postsCancelButton}>
            İptal
          </button>
          <button onClick={onConfirm} className={styles.postsConfirmButton}>
            Sil
          </button>
        </div>
      </div>
    </div>
  );
};

const VideoFeedItemActionsModal = ({
  show,
  onClose,
  feed,
  onCommentAdded,
  onCommentDeleted,
  onShared,
}) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  const { showToast } = useAuth();
  const { currentUser } = useUser();
  const isMounted = useRef(true);

  const validFeedId = feed?.id || feed?.feedId;
  const feedType = feed?.feedType || "globalFeeds";

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (show && validFeedId) fetchComments();
  }, [show, validFeedId, feedType]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/feed-actions/feed-comment-get?feedId=${validFeedId}&feedType=${feedType}`,
        {
          headers: {
            Authorization: `Bearer ${await auth.currentUser.getIdToken()}`,
          },
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Yorumlar çekilemedi");

      if (isMounted.current) setComments(data.comments.reverse());
    } catch (err) {
      console.error("Yorum çekme hatası:", err);
      showToast("Yorumlar yüklenirken hata oluştu.", "error");
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      showToast("Yorum eklemek için giriş yapmalısınız.", "error");
      return;
    }
    if (!newComment.trim() || isSubmitting) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticComment = {
      id: tempId,
      uid: currentUser.uid,
      displayName:
        currentUser.displayName ||
        currentUser.email?.split("@")[0] ||
        "Kullanıcı",
      username: currentUser.username || undefined,
      photoURL: currentUser.photoURL || DEFAULT_AVATAR,
      text: newComment.trim(),
      createdAt: new Date(),
      __optimistic: true,
    };

    setComments((prev) => [optimisticComment, ...(prev || [])]);
    setNewComment("");
    setIsSubmitting(true);

    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/feed-actions/feed-comment-add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            feedId: validFeedId,
            feedType,
            commentText: optimisticComment.text,
          }),
        }
      );

      if (!res.ok) throw new Error("Yorum eklenemedi (sunucu hatası).");

      fetchComments();
      if (onCommentAdded) onCommentAdded();
      showToast("Yorum başarıyla eklendi.", "success");
    } catch (err) {
      console.error("Yorum ekleme hatası:", err);
      setComments((prev) => (prev || []).filter((c) => c.id !== tempId));
      showToast("Yorum eklenirken hata oluştu.", "error");
    } finally {
      if (isMounted.current) setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;
    setShowDeleteModal(false);
    setLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/feed-actions/feed-comment-remove`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            commentId: commentToDelete,
            feedId: validFeedId,
          }),
        }
      );

      if (!res.ok) throw new Error("Yorum silinirken hata oluştu.");
      setComments((prev) =>
        (prev || []).filter((c) => c?.id !== commentToDelete)
      );
      showToast("Yorum başarıyla silindi.", "success");
      if (onCommentDeleted) onCommentDeleted();
    } catch (err) {
      console.error("Yorum silme hatası:", err);
      showToast("Yorum silinirken hata oluştu.", "error");
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setCommentToDelete(null);
      }
    }
  };

  const handleShare = async () => {
    try {
      const postUrl = `${window.location.origin}/feeds/${validFeedId}`;
      await navigator.clipboard.writeText(postUrl);
      showToast("Video bağlantısı kopyalandı!", "success");
      if (onShared) onShared();
    } catch (err) {
      showToast("Bağlantı kopyalanamadı.", "error");
    }
  };

  if (!show) return null;

  return (
    <div className={styles.postsModalOverlay} onClick={onClose}>
      <div
        className={styles.postsModalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.postsModalHeader}>
          <h3>Yorumlar</h3>
          <div className={styles.postsHeaderButtons}>
            <button onClick={handleShare} className={styles.postsHeaderButton}>
              <FiLink />
            </button>
            <button onClick={onClose} className={styles.postsCloseButton}>
              <FiX />
            </button>
          </div>
        </div>

        <div className={styles.postsCommentsList}>
          {loading ? (
            <div className={styles.postsLoading}>Yorumlar yükleniyor...</div>
          ) : !comments || comments.length === 0 ? (
            <div className={styles.postsEmpty}>
              Henüz yorum yok. İlk yorumu sen yap!
            </div>
          ) : (
            (comments || []).map(
              (comment) =>
                comment && (
                  <div key={comment.id} className={styles.postsCommentCard}>
                    <div className={styles.postsCommentCardInner}>
                      <img
                        src={comment?.photoURL || DEFAULT_AVATAR}
                        alt={comment?.displayName || "Kullanıcı"}
                        className={styles.postsCommentAvatar}
                      />
                      <div className={styles.postsCommentContent}>
                        <span className={styles.postsCommentUsername}>
                          {comment?.displayName || "Bilinmeyen Kullanıcı"}
                        </span>
                        <p className={styles.postsCommentText}>
                          {comment?.text}
                        </p>
                        <small
                          style={{
                            color: "#888",
                            marginTop: 8,
                            textAlign: "right",
                          }}
                        >
                          {comment?.createdAt
                            ? new Date(tsToMillis(comment.createdAt)).toLocaleString()
                            : ""}
                        </small>
                      </div>
                    </div>
                    {currentUser?.uid === comment?.uid && (
                      <button
                        className={styles.postsDeleteIcon}
                        onClick={() => {
                          setCommentToDelete(comment.id);
                          setShowDeleteModal(true);
                        }}
                        aria-label="Yorumu sil"
                        title="Yorumu sil"
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </div>
                )
            )
          )}
        </div>

        <form onSubmit={handleAddComment} className={styles.postsCommentForm}>
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Yorum yaz..."
            className={styles.postsCommentInput}
            disabled={isSubmitting}
          />
          <button
            type="submit"
            className={styles.postsSubmitBtn}
            disabled={isSubmitting || !newComment.trim()}
            aria-disabled={isSubmitting || !newComment.trim()}
          >
            <FiSend />
          </button>
        </form>
      </div>

      <DeleteConfirmationModal
        show={showDeleteModal}
        onConfirm={handleDeleteComment}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default VideoFeedItemActionsModal;
