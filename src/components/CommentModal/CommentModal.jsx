// CommentModal.jsx
import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import {
  getCommentsRemote,
  postCommentRemote,
  deleteCommentRemote,
  defaultGetAuthToken,
} from "../actions/api";
import styles from "./CommentModal.module.css";

// Yorum modalı bileşeni
export default function CommentModal({
  targetType,
  targetId,
  onClose,
  onCountsChange,
  getAuthToken = defaultGetAuthToken,
}) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCommentText, setNewCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const modalRef = useRef(null);

  // Yorumları yükleme
  useEffect(() => {
    async function loadComments() {
      setLoading(true);
      try {
        const token = await getAuthToken();
        // JWT'yi çözerek kullanıcı UID'sini al
        if (token) {
          const { uid } = JSON.parse(atob(token.split(".")[1]));
          setCurrentUserId(uid);
        }
        const response = await getCommentsRemote({ targetType, targetId, token });
        setComments(response.comments || []);
      } catch (error) {
        console.error("Yorumlar yüklenirken bir hata oluştu:", error);
        setComments([]);
      } finally {
        setLoading(false);
      }
    }
    loadComments();
  }, [targetId, targetType, getAuthToken]);

  // Yeni yorum gönderme
  async function handleCommentSubmit(e) {
    e.preventDefault();
    if (!newCommentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const tempId = `temp-${Date.now()}`;
    const tempComment = {
      id: tempId,
      uid: currentUserId,
      displayName: "Siz",
      username: "",
      photoURL: "",
      text: newCommentText,
    };

    setComments((prevComments) => [tempComment, ...prevComments]);
    setNewCommentText("");
    onCountsChange(1);

    try {
      const token = await getAuthToken();
      const response = await postCommentRemote({
        targetType,
        targetId,
        content: tempComment.text,
        token,
      });

      // Backend'den dönen tam yorum objesini kullanarak temp yorumu güncelle
      if (response && response.comment) {
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.id === tempId ? response.comment : comment
          )
        );
      } else if (response && response.id) {
        // Fallback: Eğer backend sadece id dönerse, temp id'yi güncelle
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.id === tempId ? { ...comment, id: response.id } : comment
          )
        );
      }
    } catch (error) {
      console.error("Yorum gönderilemedi:", error);
      // Hata durumunda optimistik olarak eklenen yorumu kaldır
      setComments((prevComments) =>
        prevComments.filter((comment) => comment.id !== tempId)
      );
      onCountsChange(-1);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Yorum silme
  async function handleCommentDelete(commentId) {
    if (!window.confirm("Bu yorumu silmek istediğinize emin misiniz?")) {
      return;
    }

    const originalComments = comments;
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    onCountsChange(-1);

    try {
      const token = await getAuthToken();
      await deleteCommentRemote({ targetType, targetId, commentId, token });
    } catch (error) {
      console.error("Yorum silinemedi:", error);
      setComments(originalComments);
      onCountsChange(1);
    }
  }

  // Kapatma animasyonunu tetikleyen fonksiyon
  const handleClose = () => {
    setIsClosing(true);
  };

  // Animasyon bitimini dinleyen useEffect
  useEffect(() => {
    const modalElement = modalRef.current;
    const handleAnimationEnd = () => {
      if (isClosing) {
        onClose();
      }
    };

    if (modalElement) {
      modalElement.addEventListener("animationend", handleAnimationEnd);
    }

    return () => {
      if (modalElement) {
        modalElement.removeEventListener("animationend", handleAnimationEnd);
      }
    };
  }, [isClosing, onClose]);

  return ReactDOM.createPortal(
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div
        ref={modalRef}
        className={`${styles.modal} ${isClosing ? styles.closing : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Başlık ve Kapatma Butonu */}
        <header className={styles.modalHeader}>
          <h3>Yorumlar</h3>
          <button onClick={handleClose} className={styles.closeBtn}>
            ✕
          </button>
        </header>

        {/* Yorum Listesi */}
        <div className={styles.commentsList}>
          {loading ? (
            <p style={{ textAlign: "center", color: "#888" }}>Yükleniyor...</p>
          ) : comments.length === 0 ? (
            <p style={{ textAlign: "center", color: "#888" }}>Henüz yorum yok. İlk yorumu siz yapın! ✍️</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className={styles.commentCard}>
                <img
                  src={comment.photoURL || "https://picsum.photos/40"}
                  alt={comment.displayName || "Kullanıcı"}
                  className={styles.avatar}
                />
                <div className={styles.commentContent}>
                  <strong className={styles.username}>
                    {comment.displayName || comment.username || "Anonim"}
                  </strong>
                  <p className={styles.commentText}>{comment.text}</p>
                </div>
                {comment.uid === currentUserId && (
                  <button
                    onClick={() => handleCommentDelete(comment.id)}
                    className={styles.deleteBtn}
                  >
                    Sil
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Yorum Yazma Formu */}
        <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
          <input
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Yorumunuzu yazın..."
            className={styles.commentInput}
            disabled={isSubmitting}
          />
          <button
            type="submit"
            className={styles.sendBtn}
            disabled={isSubmitting || !newCommentText.trim()}
          >
            Gönder
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}