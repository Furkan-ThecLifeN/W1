// ActionControls.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  toggleActionRemote,
  getCommentsRemote,
  postCommentRemote,
  deleteCommentRemote,
  getShareLinkRemote,
  defaultGetAuthToken,
} from "./api";
import { useActionsQueue } from "./useActionsQueue";
import styles from "./ActionControls.module.css";
import { FaHeart, FaRegHeart, FaBookmark, FaRegBookmark, FaComment, FaShare } from "react-icons/fa";

/*
Props:
- targetType: "post" | "feed" | "feeling"
- targetId: string
- initialLiked: boolean
- initialSaved: boolean
- initialCounts: { likesCount, commentsCount, shareCount }
- getAuthToken (optional) - async function returning Bearer token (defaults to Firebase if present)
*/

export default function ActionControls({
  targetType,
  targetId,
  initialLiked = false,
  initialSaved = false,
  initialCounts = { likesCount: 0, commentsCount: 0, shareCount: 0 },
  getAuthToken = defaultGetAuthToken,
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [saved, setSaved] = useState(initialSaved);
  const [counts, setCounts] = useState(initialCounts);
  const [commentModalOpen, setCommentModalOpen] = useState(false);

  // debounce timers per action
  const likeTimerRef = useRef(null);
  const saveTimerRef = useRef(null);
  const pendingLikeRef = useRef(null);
  const pendingSaveRef = useRef(null);

  const { enqueue, flushQueue } = useActionsQueue({ getAuthToken });

  // optimistic handler with 15s commit
  async function commitActionNow(action) {
    // action = { type: 'like'|'save', finalState: boolean }
    try {
      const token = await getAuthToken();
      await toggleActionRemote({
        type: action.type,
        targetType,
        targetId,
        token,
      });
      // success: nothing more (server adjusted counters via transaction)
    } catch (e) {
      // if network failed, add to local queue for retry
      enqueue({
        type: action.type,
        targetType,
        targetId,
        finalState: action.finalState,
      });
    }
  }

  function scheduleCommit(action, timerRef, pendingRef) {
    // clear existing timer
    if (timerRef.current) clearTimeout(timerRef.current);
    pendingRef.current = action;
    // set timer 15s
    timerRef.current = setTimeout(() => {
      commitActionNow(action);
      pendingRef.current = null;
      timerRef.current = null;
    }, 15000);
  }

  function toggleLike() {
    const next = !liked;
    setLiked(next);
    setCounts((c) => ({ ...c, likesCount: c.likesCount + (next ? 1 : -1) }));
    scheduleCommit({ type: "like", finalState: next }, likeTimerRef, pendingLikeRef);
  }

  function toggleSave() {
    const next = !saved;
    setSaved(next);
    setCounts((c) => ({ ...c, savesCount: (c.savesCount || 0) + (next ? 1 : -1) }));
    scheduleCommit({ type: "save", finalState: next }, saveTimerRef, pendingSaveRef);
  }

  // flush pending on unmount
  useEffect(() => {
    return () => {
      if (likeTimerRef.current && pendingLikeRef.current) {
        commitActionNow(pendingLikeRef.current);
      }
      if (saveTimerRef.current && pendingSaveRef.current) {
        commitActionNow(pendingSaveRef.current);
      }
    };
    // eslint-disable-next-line
  }, []);

  async function openComments() {
    setCommentModalOpen(true);
  }

  async function handleShare() {
    try {
      const token = await getAuthToken();
      const res = await getShareLinkRemote({ targetType, targetId, token });
      const link = res.shareLink;
      // copy to clipboard
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(link);
        alert("Link kopyalandı: " + link);
      } else {
        // fallback
        const ta = document.createElement("textarea");
        ta.value = link;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        alert("Link kopyalandı: " + link);
      }
      // update share count optimistically
      setCounts((c) => ({ ...c, shareCount: (c.shareCount || 0) + 1 }));
    } catch (e) {
      alert("Paylaş linki üretilemedi: " + e.message);
    }
  }

  return (
    <div className={styles.actionControls}>
      <button onClick={toggleLike} data-active={liked} className={styles.btnLike}>
        {liked ? <FaHeart size={18} /> : <FaRegHeart size={18} />} <span>{counts.likesCount}</span>
      </button>

      <button onClick={openComments} className={styles.btnComment}>
        <FaComment size={18} /> <span>{counts.commentsCount}</span>
      </button>

      <button onClick={toggleSave} data-active={saved} className={styles.btnSave}>
        {saved ? <FaBookmark size={18} /> : <FaRegBookmark size={18} />} <span>{counts.savesCount || 0}</span>
      </button>

      <button onClick={handleShare} className={styles.btnShare}>
        <FaShare size={18} /> <span>{counts.shareCount || 0}</span>
      </button>

      {commentModalOpen && (
        <CommentModal
          targetType={targetType}
          targetId={targetId}
          onClose={() => setCommentModalOpen(false)}
          onCountsChange={(delta) => setCounts((c) => ({ ...c, commentsCount: c.commentsCount + delta }))}
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
    // eslint-disable-next-line
  }, []);

  async function submitComment(e) {
    e.preventDefault();
    if (!newText.trim()) return;
    setSubmitting(true);
    // optimistic UI: push locally immediately with temp id
    const tempId = `temp-${Date.now()}`;
    const tempComment = { id: tempId, userId: "me", content: newText, createdAt: new Date().toISOString() };
    setComments((c) => [tempComment, ...c]);
    setNewText("");
    onCountsChange(1);

    try {
      const token = await getAuthToken();
      await postCommentRemote({ targetType, targetId, content: tempComment.content, token });
      // refetch latest for consistent ids
      await fetchComments();
    } catch (e) {
      // remove temp and decrement count
      setComments((c) => c.filter((x) => x.id !== tempId));
      onCountsChange(-1);
      alert("Yorum gönderilemedi: " + e.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function removeComment(commentId, authorId) {
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
          {loading ? <p>Yükleniyor...</p> : comments.length === 0 ? <p>Yorum yok</p> : comments.map((c) => (
            <div key={c.id} className={styles.commentItem}>
              <div className={styles.meta}>
                <strong>{c.userDisplay || c.userId === "me" ? "Sen" : c.userId}</strong>
                <small>{new Date(c.createdAt?.seconds ? c.createdAt.seconds * 1000 : c.createdAt).toLocaleString()}</small>
              </div>
              <p>{c.content}</p>
              {c.userId === "me" && <button onClick={() => removeComment(c.id)}>Sil</button>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}