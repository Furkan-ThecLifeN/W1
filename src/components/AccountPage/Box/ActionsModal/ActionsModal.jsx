import React, { useEffect, useRef, useState } from "react";
import styles from "./ActionsModal.module.css";
import { FiX, FiSend, FiTrash2, FiLink } from "react-icons/fi";
import { useAuth } from "../../../../context/AuthProvider";
import { useUser } from "../../../../context/UserContext";
import { auth, db } from "../../../../config/firebase-client";
import { collection, query, orderBy, getDocs, doc } from "firebase/firestore";

/**
 * Helper: farklı createdAt formatlarını milis çevirir
 * - Firestore Timestamp { seconds, nanoseconds }
 * - ISO string
 * - Date instance
 * - number (ms)
 */
const tsToMillis = (ts) => {
  if (!ts) return 0;
  // Firestore Timestamp
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
  // ISO string
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

// Small delete confirmation modal
const DeleteConfirmationModal = ({ show, onConfirm, onCancel }) => {
  if (!show) return null;
  return (
    <div className={styles.confirmationModalOverlay} onClick={onCancel}>
      <div
        className={styles.confirmationModalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.confirmationHeader}>
          <h4>Yorumu Sil</h4>
          <button onClick={onCancel} className={styles.confirmationCloseButton}>
            <FiX />
          </button>
        </div>
        <p>Bu yorumu silmek istediğinize emin misiniz?</p>
        <div className={styles.confirmationActions}>
          <button onClick={onCancel} className={styles.cancelButton}>
            İptal
          </button>
          <button onClick={onConfirm} className={styles.confirmButton}>
            Sil
          </button>
        </div>
      </div>
    </div>
  );
};

const ActionsModal = ({
  show,
  onClose,
  post,
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

  const validPostId = post?.id || post?.postId;
  const postType = post?.postType || "globalFeelings";

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (show && validPostId) {
      fetchComments();
    }
  }, [show, validPostId, postType]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, postType, validPostId, "comments"),
        orderBy("createdAt", "desc") // En yeniler en üstte
      );
      const querySnapshot = await getDocs(q);
      const fetchedComments = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      if (isMounted.current) setComments(fetchedComments);
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
      createdAt: new Date(), // Local Date object for optimistic rendering
      __optimistic: true,
    };

    setComments((prev) => [optimisticComment, ...(prev || [])]);
    setNewComment("");
    setIsSubmitting(true);

    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/actions/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            postId: validPostId,
            postType,
            commentText: optimisticComment.text,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Yorum eklenemedi (sunucu hatası).");
      }

      const body = await res.json();
      fetchComments(); // Başarılıysa yorumları yeniden çek
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
        `${process.env.REACT_APP_API_URL}/api/actions/comments`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            commentId: commentToDelete,
            postId: validPostId,
            postType,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Yorum silinirken hata oluştu.");
      }

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
      const postUrl = `${window.location.origin}/post/${validPostId}`;
      await navigator.clipboard.writeText(postUrl);
      showToast("Gönderi bağlantısı kopyalandı!", "success");
      if (onShared) onShared();
    } catch (err) {
      showToast("Bağlantı kopyalanamadı.", "error");
    }
  };

  if (!show) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Yorumlar</h3>
          <div className={styles.headerButtons}>
            <button onClick={handleShare} className={styles.headerButton}>
              <FiLink />
            </button>
            <button onClick={onClose} className={styles.closeButton}>
              <FiX />
            </button>
          </div>
        </div>

        <div className={styles.commentsList}>
          {loading ? (
            <div className={styles.loading}>Yorumlar yükleniyor...</div>
          ) : !comments || comments.length === 0 ? (
            <div className={styles.empty}>
              Henüz yorum yok. İlk yorumu sen yap!
            </div>
          ) : (
            (comments || []).map(
              (comment) =>
                comment && (
                  <div key={comment.id} className={styles.commentCard}>
                    <div className={styles.commentCardInner}>
                      <img
                        src={comment?.photoURL || DEFAULT_AVATAR}
                        alt={comment?.displayName || "Kullanıcı"}
                        className={styles.commentAvatar}
                      />
                      <div className={styles.commentContent}>
                        <span className={styles.commentUsername}>
                          {comment?.displayName || "Bilinmeyen Kullanıcı"}
                        </span>
                        <p className={styles.commentText}>{comment?.text}</p>
                        <small
                          style={{
                            color: "#888",
                            marginTop: 8,
                            textAlign: "right",
                          }}
                        >
                          {comment?.createdAt
                            ? new Date(
                                tsToMillis(comment.createdAt)
                              ).toLocaleString()
                            : ""}
                        </small>
                      </div>
                    </div>

                    {currentUser?.uid === comment?.uid && (
                      <button
                        className={styles.deleteIcon}
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

        <form onSubmit={handleAddComment} className={styles.commentForm}>
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Yorum yaz..."
            className={styles.commentInput}
            disabled={isSubmitting}
          />
          <button
            type="submit"
            className={styles.submitBtn}
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

export default ActionsModal;
