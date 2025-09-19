import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import {
  toggleLikeRemote,
  toggleSaveRemote,
  getShareLinkRemote,
  getPostStats,
  defaultGetAuthToken,
} from "./api";
import { useActionsQueue } from "./useActionsQueue";
import styles from "./ActionControls.module.css";
import {
  FaHeart,
  FaRegHeart,
  FaComment,
  FaShare,
  FaBookmark,
  FaRegBookmark,
} from "react-icons/fa";
import CommentModal from "../CommentModal/CommentModal";

export default function ActionControls({
  targetType,
  targetId,
  getAuthToken = defaultGetAuthToken,
}) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [stats, setStats] = useState({ likes: 0, comments: 0, shares: 0 });
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const shareBtnRef = useRef(null);

  const likeTimerRef = useRef(null);
  const saveTimerRef = useRef(null);
  const pendingLikeRef = useRef(null);
  const pendingSaveRef = useRef(null);

  const { enqueue } = useActionsQueue({ getAuthToken });

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const token = await getAuthToken();
        if (token) {
          const res = await getPostStats({ targetType, targetId, token });
          setStats(res.stats);
          setLiked(res.liked);
          setSaved(res.saved);
        }
      } catch (e) {
        console.error("İstatistikler alınamadı: ", e);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [targetId, targetType, getAuthToken]);

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
    timerRef.current = setTimeout(async () => {
      if (pendingRef.current) {
        await commitActionNow(pendingRef.current);
        pendingRef.current = null;
      }
      timerRef.current = null;
    }, 15000);
  }

  function toggleLike() {
    const next = !liked;
    setLiked(next);
    setStats((s) => ({ ...s, likes: s.likes + (next ? 1 : -1) }));
    scheduleCommit(
      { type: "like", finalState: next },
      likeTimerRef,
      pendingLikeRef
    );
  }

  function toggleSave() {
    const next = !saved;
    setSaved(next);
    scheduleCommit(
      { type: "save", finalState: next },
      saveTimerRef,
      pendingSaveRef
    );
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

  const showToast = (message, type = "success") => {
    if (!shareBtnRef.current) return;
    const rect = shareBtnRef.current.getBoundingClientRect();

    setToast({
      message,
      type,
      style: {
        top: rect.top + window.scrollY - 36 + "px",
        left: rect.left + rect.width / 2 + "px",
        transform: "translateX(-50%)",
      },
    });

    setTimeout(() => setToast(null), 2000);
  };

  async function handleShare() {
    try {
      const token = await getAuthToken();
      const res = await getShareLinkRemote({ targetType, targetId, token });
      const link = res.shareLink;

      await navigator.clipboard.writeText(link);

      setStats((s) => ({ ...s, shares: (s.shares || 0) + 1 }));
      showToast("Gönderi linki kopyalandı!", "success");
    } catch (e) {
      showToast("Paylaş linki üretilemedi: " + e.message, "error");
    }
  }

  if (loading) {
    return (
      <div className={styles.actionControls}>
        <p>Yükleniyor...</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.actionControls}>
        <button
          onClick={toggleLike}
          data-active={liked}
          className={styles.btnLike}
        >
          {liked ? <FaHeart size={18} /> : <FaRegHeart size={18} />} <span>{stats.likes}</span>
        </button>

        <button onClick={openComments} className={styles.btnComment}>
          <FaComment size={18} /> <span>{stats.comments}</span>
        </button>

        <button ref={shareBtnRef} onClick={handleShare} className={styles.btnShare}>
          <FaShare size={18} /> <span>{stats.shares}</span>
        </button>

        <button
          onClick={toggleSave}
          data-active={saved}
          className={styles.btnSave}
        >
          {saved ? <FaBookmark size={18} /> : <FaRegBookmark size={18} />}
        </button>
      </div>

      {commentModalOpen && (
        <CommentModal
          targetType={targetType}
          targetId={targetId}
          onClose={() => setCommentModalOpen(false)}
          onCountsChange={(delta) =>
            setStats((s) => ({ ...s, comments: s.comments + delta }))
          }
          getAuthToken={getAuthToken}
        />
      )}

      {toast &&
        ReactDOM.createPortal(
          <div
            className={`${styles.toast} ${styles[toast.type]}`}
            style={{
              position: "absolute",
              top: shareBtnRef.current.offsetTop - 36 + "px",
              left: shareBtnRef.current.offsetLeft + shareBtnRef.current.offsetWidth / 2 + "px",
              transform: "translateX(-50%)",
              whiteSpace: "nowrap",
              zIndex: 10,
            }}
          >
            {toast.message}
          </div>,
          document.body
        )}
    </>
  );
}