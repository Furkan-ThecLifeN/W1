// useActionsQueue.js
import { useEffect, useRef, useCallback } from "react";
import { batchActionsRemote, defaultGetAuthToken } from "./api";

// Simple local queue stored in localStorage for pending action objects:
// { type, targetType, targetId, finalState (bool), ts }
// Will flush automatically when online or on mount. Also supports navigator.sendBeacon on unload.

const QUEUE_KEY = "actions_pending_queue_v1";

function readQueue() {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}
function writeQueue(items) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
}

export function useActionsQueue({ getAuthToken = defaultGetAuthToken } = {}) {
  const flushingRef = useRef(false);

  const enqueue = useCallback((action) => {
    const q = readQueue();
    q.push({ ...action, ts: Date.now() });
    writeQueue(q);
    // attempt flush in background
    flushQueue();
  }, []);

  const flushQueue = useCallback(async () => {
    if (flushingRef.current) return;
    const items = readQueue();
    if (!items.length) return;
    flushingRef.current = true;
    try {
      const token = await getAuthToken();
      // transform to expected batch item format: { type, targetType, targetId, finalState }
      const batch = items.map((it) => ({
        type: it.type,
        targetType: it.targetType,
        targetId: it.targetId,
        finalState: it.finalState,
        userId: it.userId, // optional
      }));
      await batchActionsRemote({ items: batch, token });
      // on success clear queue
      writeQueue([]);
    } catch (e) {
      // leave queue intact for retry later
      // optionally: exponential backoff or limit retries
      // console.error("batch flush error", e);
    } finally {
      flushingRef.current = false;
    }
  }, [getAuthToken]);

  useEffect(() => {
    // flush on mount and on reconnect
    flushQueue();
    function onOnline() {
      flushQueue();
    }
    window.addEventListener("online", onOnline);

    // beforeunload -> try sendBeacon single items
    function onBeforeUnload(e) {
      const q = readQueue();
      if (!q.length) return;
      try {
        const payload = JSON.stringify(q.map(it => ({
          type: it.type,
          targetType: it.targetType,
          targetId: it.targetId,
          finalState: it.finalState,
        })));
        // use navigator.sendBeacon if available
        if (navigator.sendBeacon) {
          const blob = new Blob([payload], { type: "application/json" });
          navigator.sendBeacon("/api/actions/batch", blob);
        }
      } catch (err) {
        // noop
      }
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [flushQueue]);

  return { enqueue, flushQueue };
}
