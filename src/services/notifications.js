// src/services/notifications.js

import { auth } from "../config/firebase-client";

const API_URL = process.env.REACT_APP_API_URL;

/**
 * Kullanıcının bildirim ayarlarını backend'den çeker.
 * @returns {Promise<object>} Bildirim ayarları.
 */
export const getUserNotificationSettings = async () => {
  const token = await auth.currentUser.getIdToken();
  const response = await fetch(`${API_URL}/api/users/notifications/settings`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Bildirim ayarları alınırken hata oluştu.");
  }
  
  const data = await response.json();
  return data.settings;
};

/**
 * Kullanıcının bildirim ayarlarını backend'e göndererek günceller.
 * @param {object} updates - Güncellenecek ayarlar.
 * @returns {Promise<object>} Güncellenmiş ayarlar.
 */
export const updateUserNotificationSettings = async (updates) => {
  const token = await auth.currentUser.getIdToken();
  const response = await fetch(`${API_URL}/api/users/notifications/settings`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error("Bildirim ayarları güncellenirken hata oluştu.");
  }

  const data = await response.json();
  return data.settings;
};