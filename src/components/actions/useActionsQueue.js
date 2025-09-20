// useActionsQueue.js
import { useEffect, useRef, useCallback } from "react";
import { batchActionsRemote, sharePostRemote, defaultGetAuthToken } from "./api";

const QUEUE_KEY = "actions_pending_queue_v2";

function readQueue() {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY)) || []; }
  catch { return []; }
}

function writeQueue(items) {
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify(items)); }
  catch (e) { console.error("Kuyruk yazma hatası:", e); }
}

export function useActionsQueue({ getAuthToken = defaultGetAuthToken } = {}) {
  const flushingRef = useRef(false);
  const shareThrottleRef = useRef({});

  const enqueue = useCallback((action) => {
    const q = readQueue();
    const existingIndex = q.findIndex(
      (i) => i.type === action.type && i.targetType === action.targetType && i.targetId === action.targetId
    );

    if (action.type === "share") {
      // Sadece son share kaydedilsin
      shareThrottleRef.current[action.targetId] = action;
    } else if (existingIndex !== -1) {
      q[existingIndex] = { ...action, ts: Date.now() };
      writeQueue(q);
    } else {
      q.push({ ...action, ts: Date.now() });
      writeQueue(q);
    }

    flushQueue();
  }, []);

  const flushQueue = useCallback(async () => {
    if (flushingRef.current) return;
    const items = readQueue();
    if (!items.length && Object.keys(shareThrottleRef.current).length === 0) return;

    flushingRef.current = true;

    try {
      const token = await getAuthToken();

      // Like/Save batch
      const batchItems = items.filter(i => i.type !== "share");
      if (batchItems.length) {
        await batchActionsRemote({ items: batchItems.map(({ type, targetType, targetId, finalState }) => ({ type, targetType, targetId, finalState })), token });
      }

      // Share aksiyonları, throttle mantığı ile
      const shareItems = Object.values(shareThrottleRef.current);
      for (const s of shareItems) {
        await sharePostRemote(s.targetId, s.targetType, token);
      }
      shareThrottleRef.current = {};

      writeQueue([]);
    } catch (err) {
      console.error("Toplu işlem hatası:", err);
    } finally {
      flushingRef.current = false;
    }
  }, [getAuthToken]);

  useEffect(() => {
    flushQueue();
    const onOnline = () => flushQueue();
    window.addEventListener("online", onOnline);

    const onBeforeUnload = () => {
      const q = readQueue();
      if (!q.length) return;
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(q)], { type: "application/json" });
        navigator.sendBeacon("/api/actions/batch", blob);
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [flushQueue]);

  return { enqueue, flushQueue };
}
