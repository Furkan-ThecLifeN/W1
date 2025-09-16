// /components/Box/PostsActionsModal/PostsActionsModal.jsx

import React, { useEffect, useRef, useState, useCallback } from "react"; // ✅ useCallback buraya eklendi
import styles from "./PostsActionsModal.module.css";
import { FiX, FiSend, FiTrash2, FiLink } from "react-icons/fi";
import { useAuth } from "../../../../../context/AuthProvider";
import { useUser } from "../../../../../context/UserContext";
import { auth } from "../../../../../config/firebase-client";
import axios from "axios";

// Helper: farklı createdAt formatlarını milis çevirir
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

// Axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const PostsActionsModal = ({
  show,
  onClose,
  post,
  initialTab,
  onCommentAdded,
  onShared,
}) => {
  const modalRef = useRef(null);
  const { currentUser } = useUser();
  const { showToast } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab || "comments");
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  const postId = post?._id;
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchComments = useCallback(async () => {
    if (!postId || !isMounted.current) return;
    setLoadingComments(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      // ✅ Yorumları çekmek için doğru rota
      const response = await api.get(`/api/posts/comments?postId=${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (isMounted.current) {
        setComments(response.data.comments);
      }
    } catch (error) {
      console.error("Yorumlar getirilirken hata:", error);
      showToast("Yorumlar yüklenirken bir sorun oluştu.", "error");
    } finally {
      if (isMounted.current) {
        setLoadingComments(false);
      }
    }
  }, [postId, showToast]);

  useEffect(() => {
    if (show && activeTab === "comments") {
      fetchComments();
    }
  }, [show, activeTab, fetchComments]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const tempComment = {
      id: "temp-" + Date.now(),
      displayName: currentUser.displayName,
      photoURL: currentUser.photoURL,
      commentText: newComment,
      createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 },
      uid: currentUser.uid,
    };
    setComments((prevComments) => [tempComment, ...prevComments]);
    setNewComment("");

    try {
      const token = await auth.currentUser?.getIdToken();
      // ✅ Yorum eklemek için doğru rota
      await api.post(
        "/api/posts/comments",
        { postId, commentText: tempComment.commentText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      onCommentAdded();
      showToast("Yorumunuz eklendi.", "success");
    } catch (error) {
      console.error("Yorum eklenirken hata:", error);
      showToast("Yorum eklenemedi. Lütfen tekrar deneyin.", "error");
      setComments((prevComments) =>
        prevComments.filter((c) => c.id !== tempComment.id)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;
    setShowDeleteModal(false);

    try {
      const token = await auth.currentUser?.getIdToken();
      // ✅ Yorum silmek için doğru rota
      await api.delete("/api/posts/comments", {
        data: { postId, commentId: commentToDelete },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setComments((prevComments) =>
        prevComments.filter((c) => c.id !== commentToDelete)
      );
      onCommentAdded();
      showToast("Yorum başarıyla silindi.", "success");
    } catch (error) {
      console.error("Yorum silinirken hata:", error);
      showToast("Yorum silinirken bir sorun oluştu.", "error");
    } finally {
      setCommentToDelete(null);
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/post/${postId}`;
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        showToast("Gönderi linki kopyalandı!", "success");
        onShared();
      })
      .catch((err) => {
        console.error("Panoya kopyalama başarısız:", err);
        showToast("Link kopyalanamadı.", "error");
      });
  };

  const PostContent = () => (
    <div className={styles.postCardContent}>
      <img
        src={post?.imageUrls?.[0]}
        alt="Post"
        className={styles.postImage}
      />
      <div className={styles.postDetails}>
        <div className={styles.postHeader}>
          <img src={post?.photoURL} alt="Profil" className={styles.avatar} />
          <span className={styles.username}>{post?.displayName}</span>
        </div>
        <p className={styles.caption}>{post?.caption}</p>
      </div>
    </div>
  );

  const formattedDate = (ts) => {
    const date = new Date(tsToMillis(ts));
    return new Intl.DateTimeFormat("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
      >
        <button className={styles.closeBtn} onClick={onClose}>
          <FiX />
        </button>

        <div className={styles.tabHeader}>
          <button
            className={`${styles.tabButton} ${
              activeTab === "comments" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("comments")}
          >
            Yorumlar
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === "share" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("share")}
          >
            Paylaş
          </button>
        </div>

        {activeTab === "share" && (
          <div className={styles.shareSection}>
            <p>Bu gönderinin linkini kopyalayabilirsiniz:</p>
            <button className={styles.copyLinkBtn} onClick={handleShare}>
              <FiLink /> Bağlantıyı Kopyala
            </button>
          </div>
        )}

        {activeTab === "comments" && (
          <div className={styles.commentsSection}>
            <PostContent />
            {loadingComments ? (
              <p>Yorumlar yükleniyor...</p>
            ) : comments.length === 0 ? (
              <p>Henüz yorum yok. İlk yorumu siz yapın!</p>
            ) : (
              <div className={styles.commentsList}>
                {comments
                  .sort((a, b) => tsToMillis(b.createdAt) - tsToMillis(a.createdAt))
                  .map((comment) => (
                    <div key={comment.id} className={styles.commentItem}>
                      <img
                        src={comment.photoURL}
                        alt="Profil"
                        className={styles.commentAvatar}
                      />
                      <div className={styles.commentTextContent}>
                        <div className={styles.commentHeader}>
                          <span className={styles.commentUsername}>
                            {comment.displayName}
                          </span>
                          <span className={styles.commentDate}>
                            {formattedDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className={styles.commentBody}>{comment.commentText}</p>
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
                  ))}
              </div>
            )}

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
        )}

        {showDeleteModal && (
          <div className={styles.deleteModal}>
            <p>Bu yorumu silmek istediğinizden emin misiniz?</p>
            <button onClick={handleDeleteComment}>Evet, Sil</button>
            <button onClick={() => setShowDeleteModal(false)}>İptal</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostsActionsModal;