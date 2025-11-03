// actions/api.js
// API wrapper for actions endpoints. Uses Firebase modular SDK if available to get ID token.
// If you don't use Firebase client here, pass getAuthToken function to the hooks/components.

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001";

export async function defaultGetAuthToken() {
  try {
    const { getAuth } = await import("firebase/auth");
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  } catch (e) {
    return null;
  }
}

async function request(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    // Backend 404 verdiğinde hata burada fırlatılıyor.
    const txt = await res.text();
    // Gelen {"error":"target not found"} mesajı burada Error objesine dönüşüyor.
    throw new Error(txt || res.statusText); 
  }
  
  return res.json();
}

// Like toggle endpoint
export async function toggleLikeRemote({ targetType, targetId, finalState, token }) {
  return request("/api/actions/toggleLike", {
    method: "POST",
    body: { targetType, targetId, finalState },
    token,
  });
}

// Save toggle endpoint
export async function toggleSaveRemote({ targetType, targetId, finalState, token }) {
  return request("/api/actions/toggleSave", {
    method: "POST",
    body: { targetType, targetId, finalState },
    token,
  });
}

// Get post stats
export async function getPostStats({ targetType, targetId, token }) {
  // Frontend'den giden istek bu. Bu kod doğru görünüyor.
  return request(`/api/actions/getStats/${encodeURIComponent(targetType)}/${encodeURIComponent(targetId)}`, {
    method: "GET",
    token,
  });
}

// Like/share unified toggle (legacy)
export async function toggleActionRemote({ type, targetType, targetId, token }) {
  if (!["like", "share"].includes(type)) {
    throw new Error("Invalid action type. Supported: 'like', 'share'");
  }
  return request("/api/actions/toggle", {
    method: "POST",
    body: { type, targetType, targetId },
    token,
  });
}

// Comment endpoints
export async function postCommentRemote({ targetType, targetId, content, token }) {
  return request("/api/actions/comment", {
    method: "POST",
    body: { targetType, targetId, content },
    token,
  });
}

export async function getCommentsRemote({ targetType, targetId, token }) {
  return request(`/api/actions/comments/${encodeURIComponent(targetType)}/${encodeURIComponent(targetId)}`, {
    method: "GET",
    token,
  });
}

// Yorum silme isteği
export async function deleteCommentRemote({ commentId, token, targetType, targetId }) {
  return request(`/api/actions/deleteComment/${commentId}?targetType=${targetType}&targetId=${targetId}`, {
    method: "DELETE",
    token,
  });
}

// Share link endpoint
export async function getShareLinkRemote({ targetType, targetId, token }) {
  return request("/api/actions/shareLink", {
    method: "POST",
    body: { targetType, targetId },
    token,
  });
}

// Share post endpoint (for queue/throttle)
export async function sharePostRemote(targetId, targetType, token) {
  return request("/api/actions/shareLink", {
    method: "POST",
    body: { targetId, targetType },
    token,
  });
}

// Paylaşım isteği
export async function sendShareRemote({ targetType, targetId, receiverUid, getAuthToken = defaultGetAuthToken }) {
  const token = await getAuthToken();
  return request("/api/actions/share", {
    method: "POST",
    body: { targetType, targetId, receiverUid },
    token,
  });
}

// Batch endpoint for like/save actions
export async function batchActionsRemote({ items, token }) {
  return request("/api/actions/batch", {
    method: "POST",
    body: { items },
    token,
  });
}

// New: Get following users endpoint
export async function getFollowingRemote({ token }) {
  return request("/api/actions/following", { method: "GET", token });
}

// ✨ YENİ: Şikayet gönderme fonksiyonu
export async function createReportRemote({ postId, reportedUserId, reason, token }) {
  return request("/api/reports/create", { // Güncellenmiş rota: /api/reports/create
    method: "POST",
    body: { postId, reportedUserId, reason },
    token,
  });
}
