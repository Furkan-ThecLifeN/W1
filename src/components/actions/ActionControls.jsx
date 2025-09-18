// ActionControls.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  toggleLikeRemote, // Buradan import edilmeli
  toggleSaveRemote, // Buradan import edilmeli
  getCommentsRemote,
  postCommentRemote,
  deleteCommentRemote,
  getShareLinkRemote,
  defaultGetAuthToken,
} from "./api";
import { useActionsQueue } from "./useActionsQueue";
import styles from "./ActionControls.module.css";
import { FaHeart, FaRegHeart, FaComment, FaShare, FaBookmark, FaRegBookmark } from "react-icons/fa";

/*
Props:
- targetType: "post" | "feed" | "feeling"
- targetId: string
- initialLiked: boolean
- initialSaved: boolean
- initialStats: { likes: number, comments: number, shares: number }
- getAuthToken (optional)
*/

export default function ActionControls({
  targetType,
  targetId,
  initialLiked = false,
  initialSaved = false,
  initialStats = { likes: 0, comments: 0, shares: 0 },
  getAuthToken = defaultGetAuthToken,
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [saved, setSaved] = useState(initialSaved);
  const [stats, setStats] = useState(initialStats);
  const [commentModalOpen, setCommentModalOpen] = useState(false);

  const likeTimerRef = useRef(null);
  const saveTimerRef = useRef(null);
  const pendingLikeRef = useRef(null);
  const pendingSaveRef = useRef(null);

  const { enqueue } = useActionsQueue({ getAuthToken });

  async function commitActionNow(action) {
    try {
      const token = await getAuthToken();
      if (action.type === "like") {
        await toggleLikeRemote({ targetType, targetId, token });
      } else if (action.type === "save") {
        await toggleSaveRemote({ targetType, targetId, token });
      }
    } catch (e) {
      enqueue({
        type: action.type,
        targetType,
        targetId,
        finalState: action.finalState,
      });
    }
  }

  function scheduleCommit(action, timerRef, pendingRef) {
    if (timerRef.current) clearTimeout(timerRef.current);
    pendingRef.current = action;
    timerRef.current = setTimeout(() => {
      commitActionNow(action);
      pendingRef.current = null;
      timerRef.current = null;
    }, 15000);
  }

  function toggleLike() {
    const next = !liked;
    setLiked(next);
    setStats((s) => ({ ...s, likes: s.likes + (next ? 1 : -1) }));
    scheduleCommit({ type: "like", finalState: next }, likeTimerRef, pendingLikeRef);
  }

  function toggleSave() {
    const next = !saved;
    setSaved(next);
    scheduleCommit({ type: "save", finalState: next }, saveTimerRef, pendingSaveRef);
  }

  useEffect(() => {
    return () => {
      if (likeTimerRef.current && pendingLikeRef.current) {
        commitActionNow(pendingLikeRef.current);
      }
      if (saveTimerRef.current && pendingSaveRef.current) {
        commitActionNow(pendingSaveRef.current);
      }
    };
  }, []);

  async function openComments() {
    setCommentModalOpen(true);
  }

  async function handleShare() {
    try {
      const token = await getAuthToken();
      const res = await getShareLinkRemote({ targetType, targetId, token });
      const link = res.shareLink;

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        const ta = document.createElement("textarea");
        ta.value = link;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }

      setStats((s) => ({ ...s, shares: (s.shares || 0) + 1 }));
      alert("Link kopyalandı: " + link);
    } catch (e) {
      alert("Paylaş linki üretilemedi: " + e.message);
    }
  }

  return (
    <div className={styles.actionControls}>
      <button onClick={toggleLike} data-active={liked} className={styles.btnLike}>
        {liked ? <FaHeart size={18} /> : <FaRegHeart size={18} />} <span>{stats.likes}</span>
      </button>

      <button onClick={toggleSave} data-active={saved} className={styles.btnSave}>
        {saved ? <FaBookmark size={18} /> : <FaRegBookmark size={18} />}
      </button>

      <button onClick={openComments} className={styles.btnComment}>
        <FaComment size={18} /> <span>{stats.comments}</span>
      </button>

      <button onClick={handleShare} className={styles.btnShare}>
        <FaShare size={18} /> <span>{stats.shares}</span>
      </button>

      {commentModalOpen && (
        <CommentModal
          targetType={targetType}
          targetId={targetId}
          onClose={() => setCommentModalOpen(false)}
          onCountsChange={(delta) => setStats((s) => ({ ...s, comments: s.comments + delta }))}
          getAuthToken={getAuthToken}
        />
      )}
    </div>
  );
}

/* --- CommentModal component --- */
function CommentModal({ targetType, targetId, onClose, onCountsChange, getAuthToken = defaultGetAuthToken }) {
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
      await postCommentRemote({ targetType, targetId, content: tempComment.text, token });
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

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <header className={styles.modalHeader}>
          <h3>Yorumlar</h3>
          <button onClick={onClose} className={styles.closeBtn}>✕</button>
        </header>

        <form onSubmit={submitComment} className={styles.commentForm}>
          <input value={newText} onChange={(e) => setNewText(e.target.value)} placeholder="Yorum yaz..." />
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
                  <small>{new Date(c.createdAt?.seconds ? c.createdAt.seconds * 1000 : c.createdAt).toLocaleString()}</small>
                </div>
                <p>{c.text}</p>
                {c.uid === "me" && <button onClick={() => removeComment(c.id)}>Sil</button>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}