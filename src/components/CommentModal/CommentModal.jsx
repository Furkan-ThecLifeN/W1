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

  async function fetchComments() {
    setLoading(true);
    try {
      const token = await getAuthToken();
      const res = await getCommentsRemote({ targetType, targetId, token });
      setComments(res.comments || []);
    } catch (e) {
      console.error(e);
      alert("Yorumlar alınamadı");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchComments();
  }, []);

  async function submitComment(e) {
    e.preventDefault();
    if (!newText.trim()) return;

    setSubmitting(true);
    const tempId = `temp-${Date.now()}`;
    const tempComment = {
      id: tempId,
      uid: "me",
      username: "me",
      displayName: "Sen",
      photoURL: "",
      text: newText,
      createdAt: new Date(),
    };
    setComments((c) => [tempComment, ...c]);
    setNewText("");
    onCountsChange(1);

    try {
      const token = await getAuthToken();
      await postCommentRemote({
        targetType,
        targetId,
        content: tempComment.text,
        token,
      });
      await fetchComments();
    } catch (e) {
      setComments((c) => c.filter((x) => x.id !== tempId));
      onCountsChange(-1);
      alert("Yorum gönderilemedi: " + e.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function removeComment(commentId) {
    if (!window.confirm("Yorumu silmek istiyor musun?")) return;
    try {
      const token = await getAuthToken();
      await deleteCommentRemote({ targetType, targetId, commentId, token });
      setComments((c) => c.filter((x) => x.id !== commentId));
      onCountsChange(-1);
    } catch (e) {
      alert("Yorum silinemedi: " + e.message);
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
              <div key={c.id} className={styles.commentItem}>
                <div className={styles.meta}>
                  <strong>{c.displayName || c.username}</strong>
                  <small>
                    {new Date(
                      c.createdAt?.seconds ? c.createdAt.seconds * 1000 : c.createdAt
                    ).toLocaleString()}
                  </small>
                </div>
                <p>{c.text}</p>
                {c.uid === "me" && (
                  <button
                    className={styles.deleteBtn}
                    onClick={() => removeComment(c.id)}
                  >
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