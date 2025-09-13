// src/components/AccountPage/Box/ActionsModal/ActionsModal.jsx
import React, { useState, useEffect } from "react";
import styles from "./ActionsModal.module.css";
import { FiX, FiSend, FiTrash2, FiLink } from "react-icons/fi";
import { useAuth } from "../../../../context/AuthProvider";
import { useUser } from "../../../../context/UserContext";
import { auth } from "../../../../config/firebase-client";

const ActionsModal = ({
  show,
  onClose,
  post,
  onCommentAdded,
  onCommentDeleted,
  onShared,
}) => {
  const [comments, setComments] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useAuth();
  const { currentUser } = useUser();

  const isMyPost = currentUser && currentUser.uid === post.uid;
  const validPostId = post?.id || post?.postId;
  const postType = post?.postType || "globalFeelings";

  useEffect(() => {
    if (show && validPostId) {
      fetchComments();
    }
  }, [show, validPostId, postType]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/actions/comments?postId=${validPostId}&postType=${postType}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Yorumlar çekilirken bir hata oluştu.");
      const data = await res.json();
      setComments(data.comments);
    } catch (error) {
      console.error("Yorum çekme hatası:", error);
      showToast("Yorumlar yüklenirken hata oluştu.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

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
            postType: postType,
            commentText: newComment,
          }),
        }
      );
      if (!res.ok) throw new Error("Yorum eklenirken bir hata oluştu.");
      const newCommentData = await res.json();
      setComments((prevComments) => [...(prevComments || []), newCommentData.comment]);
      setNewComment("");
      showToast("Yorumunuz eklendi!", "success");
      if (onCommentAdded) onCommentAdded();
    } catch (error) {
      console.error("Yorum ekleme hatası:", error);
      showToast("Yorum eklenirken hata oluştu.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Bu yorumu silmek istediğinize emin misiniz?")) return;
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
          body: JSON.stringify({ commentId, postId: validPostId, postType }),
        }
      );
      if (!res.ok) throw new Error("Yorum silinirken bir hata oluştu.");
      setComments(comments.filter((c) => c.id !== commentId));
      showToast("Yorum başarıyla silindi.", "success");
      if (onCommentDeleted) onCommentDeleted();
    } catch (error) {
      console.error("Yorum silme hatası:", error);
      showToast("Yorum silinirken hata oluştu.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Sayfa bağlantısı kopyalandı!", "success");
      if (onShared) onShared();
    } catch (error) {
      console.error("Kopyalama hatası:", error);
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
          ) : comments === null || comments.length === 0 ? (
            <div className={styles.empty}>Henüz yorum yok. İlk yorumu sen yap!</div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className={styles.commentCard}>
                <div className={styles.commentCardInner}>
                  <img
                    src={
                      comment.userPhotoURL ||
                      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                    }
                    alt={comment.displayName || "Kullanıcı"}
                    className={styles.commentAvatar}
                  />
                  <div className={styles.commentContent}>
                    <span className={styles.commentUsername}>
                      {comment.displayName || "Bilinmeyen Kullanıcı"}
                    </span>
                    <p className={styles.commentText}>{comment.text}</p>
                  </div>
                </div>
                {currentUser?.uid === comment.userId && (
                  <FiTrash2
                    className={styles.deleteIcon}
                    onClick={() => handleDeleteComment(comment.id)}
                  />
                )}
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleAddComment} className={styles.commentForm}>
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Yorum yaz..."
            className={styles.commentInput}
          />
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting || !newComment.trim()}
          >
            <FiSend />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ActionsModal;