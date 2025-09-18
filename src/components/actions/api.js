// api.js
// Small API wrapper for actions endpoints. Uses Firebase modular SDK if available to get ID token.
// If you don't use Firebase client here, pass getAuthToken function to the hooks/components (see README).

// Corrected BASE_URL to the root of your API.
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
    const txt = await res.text();
    throw new Error(txt || res.statusText);
  }
  return res.json();
}

export async function toggleActionRemote({ type, targetType, targetId, token }) {
  // Corrected path to include the full API route.
  return request("/api/actions/toggle", {
    method: "POST",
    body: { type, targetType, targetId },
    token,
  });
}

export async function postCommentRemote({ targetType, targetId, content, token }) {
  // Corrected path.
  return request("/api/actions/comment", {
    method: "POST",
    body: { type: "comment", targetType, targetId, content },
    token,
  });
}

export async function getCommentsRemote({ targetType, targetId, token }) {
  // Corrected path.
  return request(`/api/actions/comments/${encodeURIComponent(targetType)}/${encodeURIComponent(targetId)}`, {
    method: "GET",
    token,
  });
}

export async function deleteCommentRemote({ targetType, targetId, commentId, token }) {
  // Corrected path.
  return request(`/api/actions/comment/${encodeURIComponent(targetType)}/${encodeURIComponent(targetId)}/${encodeURIComponent(commentId)}`, {
    method: "DELETE",
    token,
  });
}

export async function getShareLinkRemote({ targetType, targetId, token }) {
  // Corrected path.
  return request("/api/actions/shareLink", {
    method: "POST",
    body: { targetType, targetId },
    token,
  });
}

// Optional: batch endpoint, only if backend supports /actions/batch
export async function batchActionsRemote({ items, token }) {
  // Corrected path.
  return request("/api/actions/batch", {
    method: "POST",
    body: { actions: items },
    token,
  });
}