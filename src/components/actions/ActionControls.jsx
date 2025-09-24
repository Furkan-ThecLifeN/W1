import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import {
  toggleLikeRemote,
  toggleSaveRemote,
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
import ShareModal from "../ShareModal/ShareModal";
import eventBus from "../../utils/eventBus";
import { useAuth } from "../../context/AuthProvider";

export default function ActionControls({
  targetType,
  targetId,
  getAuthToken = defaultGetAuthToken,
  commentsDisabled,
  postOwnerUid, // Post sahibinin UID'si için yeni prop
}) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [stats, setStats] = useState({ likes: 0, comments: 0, shares: 0 });
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const shareBtnRef = useRef(null);
  const { currentUser } = useAuth(); // Mevcut kullanıcıyı alın

  const likeTimerRef = useRef(null);
  const saveTimerRef = useRef(null);
  const pendingLikeRef = useRef(null);
  const pendingSaveRef = useRef(null);

  const { enqueue } = useActionsQueue({ getAuthToken });

  useEffect(() => {
    let mounted = true;

    async function fetchStats() {
      try {
        const token = await getAuthToken();
        if (!token || !mounted) return;

        const res = await getPostStats({ targetType, targetId, token });

        if (!mounted) return;
        setStats(res.stats);
        setLiked(res.liked);
        setSaved(res.saved);
      } catch (e) {
        console.error("İstatistikler alınamadı: ", e);
      }
    }

    fetchStats();

    return () => {
      mounted = false;
    };
  }, [targetType, targetId, getAuthToken]);

  async function commitActionNow(action) {
    try {
      const token = await getAuthToken();
      if (action.type === "like") {
        await toggleLikeRemote({
          targetType: action.targetType,
          targetId: action.targetId,
          finalState: action.finalState,
          token,
        });

        // Eğer beğenme başarılıysa ve kullanıcı kendi gönderisini beğenmediyse event'i yayınla
        if (action.finalState && currentUser.uid !== postOwnerUid) {
          const newNotification = {
            id: 'temp-' + Date.now(),
            fromUsername: currentUser.displayName || 'Anonim',
            fromUid: currentUser.uid,
            toUid: postOwnerUid,
            type: 'like',
            content: null,
            createdAt: new Date().toISOString(),
            isRead: false,
          };
          eventBus.dispatchEvent(new CustomEvent('notificationCreated', { detail: newNotification }));
        }

      } else if (action.type === "save") {
        await toggleSaveRemote({
          targetType: action.targetType,
          targetId: action.targetId,
          finalState: action.finalState,
          token,
        });
      }
    } catch (e) {
      console.error("Action commit error:", e);
      enqueue({
        type: action.type,
        targetType: action.targetType,
        targetId: action.targetId,
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
    }, 7500);
  }

  function toggleLike() {
    const next = !liked;
    setLiked(next);
    setStats((s) => ({ ...s, likes: Math.max(0, s.likes + (next ? 1 : -1)) }));
    scheduleCommit(
      { type: "like", targetType, targetId, finalState: next },
      likeTimerRef,
      pendingLikeRef
    );
  }

  function toggleSave() {
    const next = !saved;
    setSaved(next);
    setStats((s) => ({
      ...s,
      saves: Math.max(0, (s.saves || 0) + (next ? 1 : -1)),
    }));
    scheduleCommit(
      { type: "save", targetType, targetId, finalState: next },
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

  function openComments() {
    setCommentModalOpen(true);
  }

  const handleShareSuccess = () => {
    setStats((s) => ({ ...s, shares: (s.shares || 0) + 1 }));
  };

  async function handleShare() {
    setShareModalOpen(true);
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
        whiteSpace: "nowrap",
      },
    });

    setTimeout(() => setToast(null), 2000);
  };

  return (
    <>
      <div className={styles.actionControls}>
        <button
          onClick={toggleLike}
          data-active={liked}
          className={styles.btnLike}
        >
          {liked ? <FaHeart size={18} /> : <FaRegHeart size={18} />}{" "}
          <span>{stats.likes}</span>
        </button>

        {!commentsDisabled && (
          <button onClick={openComments} className={styles.btnComment}>
            <FaComment size={18} /> <span>{stats.comments}</span>
          </button>
        )}

        <button
          ref={shareBtnRef}
          onClick={handleShare}
          className={styles.btnShare}
        >
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
          postOwnerUid={postOwnerUid} // CommentModal'a post sahibinin UID'sini geçin
        />
      )}

      {shareModalOpen && (
        <ShareModal
          postId={targetId}
          onClose={() => setShareModalOpen(false)}
          getAuthToken={getAuthToken}
          onSuccess={handleShareSuccess}
        />
      )}

      {toast &&
        ReactDOM.createPortal(
          <div
            className={`${styles.toast} ${styles[toast.type]}`}
            style={{
              position: "absolute",
              top: shareBtnRef.current.offsetTop - 36 + "px",
              left:
                shareBtnRef.current.offsetLeft +
                shareBtnRef.current.offsetWidth / 2 +
                "px",
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