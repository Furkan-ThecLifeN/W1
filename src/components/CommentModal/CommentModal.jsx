import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import {
  getCommentsRemote,
  postCommentRemote,
  deleteCommentRemote,
  defaultGetAuthToken,
} from "../actions/api";
import styles from "./CommentModal.module.css";
// import { getAuth } from "firebase/auth"; // ARTIK GEREKLİ DEĞİL
import { useAuth } from "../../context/AuthProvider"; // 1. ADIM: AuthContext'i import et

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
  
  // const [currentUserId, setCurrentUserId] = useState(null); // 2. ADIM: Bu state'i kaldır
  const { currentUser } = useAuth(); // 3. ADIM: currentUser'ı context'ten al
  
  const [isClosing, setIsClosing] = useState(false);
  const modalRef = useRef(null);

  // --- DEĞİŞİKLİK 1: Yorumları Yükleme ---
  // Artık `currentUser` değişikliğini dinleyecek
  useEffect(() => {
    let mounted = true;
    async function loadComments() {
      setLoading(true);
      let token = null;

      try {
        // 4. ADIM: Kullanıcı kontrolünü getAuth() yerine currentUser ile yap
        if (currentUser) {
          // Eğer kullanıcı varsa, token'ı al
          token = await getAuthToken();
        }

        // API'yi çağır (token null olsa bile çalışacak)
        const response = await getCommentsRemote({ targetType, targetId, token });
        if (mounted) {
          setComments(response.comments || []);
        }
      } catch (error) {
        console.error("Yorumlar yüklenirken bir hata oluştu:", error);
        if (mounted) {
          setComments([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    loadComments();
    return () => {
      mounted = false;
    };
    // 5. ADIM: currentUser'ı dependency array'e ekle
  }, [targetId, targetType, getAuthToken, currentUser]);

  // Yeni yorum gönderme
  async function handleCommentSubmit(e) {
    e.preventDefault();
    // 6. ADIM: Kontrolü currentUser ile yap
    if (!newCommentText.trim() || isSubmitting || !currentUser) return;

    setIsSubmitting(true);
    const tempId = `temp-${Date.now()}`;
    const tempComment = {
      id: tempId,
      uid: currentUser.uid, // currentUser'dan al
      displayName: currentUser.displayName || "Siz", // Context'ten gelen bilgiyi kullan
      username: currentUser.username || "", // Context'ten gelen bilgiyi kullan
      photoURL: currentUser.photoURL || "", // Context'ten gelen bilgiyi kullan
      text: newCommentText,
    };

    setComments((prevComments) => [tempComment, ...prevComments]);
    const commentToPost = newCommentText;
    setNewCommentText("");
    onCountsChange(1);

    try {
      const token = await getAuthToken();
      const response = await postCommentRemote({
        targetType,
        targetId,
        content: commentToPost,
        token,
      });

      if (response && response.comment) {
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.id === tempId ? response.comment : comment
          )
        );
      } else if (response && response.id) {
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.id === tempId ? { ...comment, id: response.id } : comment
          )
        );
      }
    } catch (error) {
      console.error("Yorum gönderilemedi:", error);
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

        {/* Yorum Listesi (Giriş yapmasa da görünür) */}
        <div className={styles.commentsList}>
          {loading ? (
            <p style={{ textAlign: "center", color: "#888" }}>Yükleniyor...</p>
          ) : comments.length === 0 ? (
            <p style={{ textAlign: "center", color: "#888" }}>
              Henüz yorum yok. ✍️
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className={styles.commentCard}>
                <img
                  src={comment.photoURL || "https.picsum.photos/40"}
                  alt={comment.displayName || "Kullanıcı"}
                  className={styles.avatar}
                />
                <div className={styles.commentContent}>
                  <strong className={styles.username}>
                    {comment.displayName || comment.username || "Anonim"}
                  </strong>
                  <p className={styles.commentText}>{comment.text}</p>
                </div>
                {/* 7. ADIM: Kontrolü currentUser ile yap */}
                {currentUser && comment.uid === currentUser.uid && (
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

        {/* --- DEĞİŞİKLİK 2: Koşullu Yorum Formu --- */}
        {/* 8. ADIM: Kontrolü currentUser ile yap */}
        {currentUser ? (
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
        ) : (
          <div className={styles.loginPrompt}>
            <p>
              {/* Tutarlılık için /login yerine /auth kullanmak daha iyi olabilir */}
              Yorum yapmak için lütfen <a href="/auth">giriş yapın</a>.
            </p>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}