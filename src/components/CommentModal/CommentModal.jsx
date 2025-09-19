import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import {
  getCommentsRemote,
  postCommentRemote,
  deleteCommentRemote,
  defaultGetAuthToken,
} from "../actions/api";
import styles from "./CommentModal.module.css";

export default function CommentModal({
  targetType,
  targetId,
  onClose,
  onCountsChange,
  getAuthToken = defaultGetAuthToken,
}) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newText, setNewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Kullanıcı ID'sini almak ve yorumları yüklemek için
  useEffect(() => {
    async function initComments() {
      setLoading(true);
      try {
        const token = await getAuthToken();
        const res = await getCommentsRemote({ targetType, targetId, token });
        const { uid } = JSON.parse(atob(token.split(".")[1]));
        setCurrentUserId(uid);
        setComments(res.comments || []);
      } catch (e) {
        console.error("Yorumlar alınamadı: ", e);
      } finally {
        setLoading(false);
      }
    }
    initComments();
  }, [targetId, targetType, getAuthToken]);

  async function submitComment(e) {
    e.preventDefault();
    if (!newText.trim() || !currentUserId) return;

    setSubmitting(true);
    const tempId = `temp-${Date.now()}`;
    const tempComment = {
      id: tempId,
      uid: currentUserId,
      displayName: "Sen", // Bu geçici bilgi daha sonra backend'den gelen veri ile güncellenecek
      text: newText,
      createdAt: new Date(),
    };
    
    // Opt-inistik UI güncellemesi
    setComments((c) => [tempComment, ...c]);
    setNewText("");
    onCountsChange(1);

    try {
      const token = await getAuthToken();
      const res = await postCommentRemote({
        targetType,
        targetId,
        content: tempComment.text,
        token,
      });

      // Backend'den gelen gerçek ID ile geçici yorumu güncelle
      setComments((c) =>
        c.map((comment) => (comment.id === tempId ? { ...comment, id: res.id } : comment))
      );
    } catch (e) {
      // Hata durumunda optimistik güncellemeyi geri al
      setComments((c) => c.filter((x) => x.id !== tempId));
      onCountsChange(-1);
      console.error("Yorum gönderilemedi: ", e);
    } finally {
      setSubmitting(false);
    }
  }

  // Yorumu silme işlevi
  async function handleDelete(commentId) {
    try {
      const token = await getAuthToken();
      await deleteCommentRemote({ targetType, targetId, commentId, token });
      setComments((prev) => prev.filter(c => c.id !== commentId));
      onCountsChange(-1);
    } catch (e) {
      console.error("Yorum silinemedi: ", e);
    }
  }

  return ReactDOM.createPortal(
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <header className={styles.modalHeader}>
          <h3>Yorumlar</h3>
          <button onClick={onClose} className={styles.closeBtn}>
            ✕
          </button>
        </header>

        <form onSubmit={submitComment} className={styles.commentForm}>
          <input
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Yorum yaz..."
            disabled={submitting}
          />
          <button disabled={submitting || !newText.trim()}>Gönder</button>
        </form>

        <div className={styles.commentsList}>
          {loading ? (
            <p>Yükleniyor...</p>
          ) : comments.length === 0 ? (
            <p>Yorum yok</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className={styles.commentCard}>
                <div className={styles.meta}>
                  <strong>{c.displayName || c.username}</strong>
                  <small>
                    {c.createdAt?.seconds
                      ? new Date(c.createdAt.seconds * 1000).toLocaleString()
                      : "Just now"}
                  </small>
                </div>
                <p>{c.text}</p>
                {c.uid === currentUserId && (
                  <button onClick={() => handleDelete(c.id)} className={styles.deleteBtn}>
                    Sil
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
